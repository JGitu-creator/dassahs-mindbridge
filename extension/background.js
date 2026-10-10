// Dassah's Prism: Neural Bridge — background service worker (v1.4.0)

// v1.4.0: sessionStorage handoff instead of URL params
// Documents are no longer encoded into `?text=` (length limits, leaks into
// history/referrers/server logs). Instead we open the Prism app and inject the
// document into the tab's sessionStorage under `prism_pending_document`.
const PRISM_APP_URL = "https://dassahs-mindbridge.vercel.app";
const PRISM_HANDOFF_PATH = "/";
const PRISM_STORAGE_KEY = "prism_pending_document";
const MAX_DOCUMENT_CHARS = 8000;

// Runs inside the Prism tab (page context): writes the doc and notifies the page
// in case it already mounted before injection.
function writePendingDocument(storageKey, documentContent) {
  try {
    sessionStorage.setItem(storageKey, documentContent);
    window.dispatchEvent(new CustomEvent("prism:pending-document", { detail: { length: documentContent.length } }));
  } catch (e) {
    console.warn("Dassah's Prism: sessionStorage handoff failed", e);
  }
}

// v1.4.0: sessionStorage handoff instead of URL params
function openPrismWithDocument(documentContent) {
  const content = String(documentContent || "").slice(0, MAX_DOCUMENT_CHARS);
  chrome.tabs.create({ url: `${PRISM_APP_URL}${PRISM_HANDOFF_PATH}` }, (tab) => {
    if (!tab || tab.id === undefined) return;
    const tabId = tab.id;
    let injected = false;

    const inject = () => {
      if (injected) return;
      injected = true;
      chrome.tabs.onUpdated.removeListener(onUpdated);
      chrome.scripting
        .executeScript({
          target: { tabId },
          func: writePendingDocument,
          args: [PRISM_STORAGE_KEY, content],
          injectImmediately: true,
        })
        .catch((err) => console.warn("Dassah's Prism: injection failed", err));
    };

    // Inject as early as possible once the Prism origin has committed.
    function onUpdated(updatedTabId, changeInfo, updatedTab) {
      if (updatedTabId !== tabId) return;
      const url = updatedTab.url || changeInfo.url || "";
      if (!url.startsWith(PRISM_APP_URL)) return;
      if (changeInfo.status === "loading" || changeInfo.status === "complete") inject();
    }
    chrome.tabs.onUpdated.addListener(onUpdated);
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "refractSelection",
    title: "Refract into Dassah's Prism",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "refractSelection" && info.selectionText) {
    // v1.4.0: sessionStorage handoff instead of URL params
    openPrismWithDocument(info.selectionText);
  }
});

// Listener for messages from content scripts / popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showNoiseAlert") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "logo.png",
      title: "High Noise Detected",
      message: `This page has ~${request.wordCount} words. Consider refracting with Dassah's Prism for better focus.`,
      priority: 1
    });
  }
  if (request.action === "openPrismWithDocument") {
    // v1.4.0: sessionStorage handoff instead of URL params
    openPrismWithDocument(request.text);
    sendResponse({ ok: true });
  }
});
