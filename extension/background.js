// Dassah's Prism: Neural Bridge — background service worker (v1.4.0)

// v1.4.0: sessionStorage handoff instead of URL params
// Documents are no longer encoded into `?text=` (length limits, leaks into
// history/referrers/server logs). Instead we open the Prism app and inject the
// document into the tab's sessionStorage under `prism_pending_document`.
const PRISM_APP_URL = "https://dassahs-prism.vercel.app";
const PRISM_HANDOFF_PATH = "/";
const PRISM_CANVAS_PATH = "/canvas";
const PRISM_STORAGE_KEY = "prism_pending_document";
const PRISM_CANVAS_KEY = "prism_canvas_handoff";
const MAX_DOCUMENT_CHARS = 25000;

// Runs inside the Prism tab (page context): writes the doc and notifies the page
// in case it already mounted before injection.
function writePendingDocument(storageKey, documentContent, eventName) {
  try {
    sessionStorage.setItem(storageKey, documentContent);
    window.dispatchEvent(new CustomEvent(eventName, { detail: { length: documentContent.length } }));
  } catch (e) {
    console.warn("Dassah's Prism: sessionStorage handoff failed", e);
  }
}

// v1.5.2: sessionStorage handoff (routes Canvas pages straight into /canvas Prism Play)
function openPrismWithDocument(documentContent, options = {}) {
  const isCanvas = options.source === "canvas";
  const targetPath = isCanvas ? PRISM_CANVAS_PATH : PRISM_HANDOFF_PATH;
  const storageKey = isCanvas ? PRISM_CANVAS_KEY : PRISM_STORAGE_KEY;
  const eventName = isCanvas ? "prism:canvas-handoff" : "prism:pending-document";
  const content = isCanvas
    ? JSON.stringify({
        title: String(options.title || "Canvas Reading"),
        text: String(documentContent || "").slice(0, MAX_DOCUMENT_CHARS),
        url: String(options.url || ""),
      })
    : String(documentContent || "").slice(0, 8000);

  chrome.tabs.create({ url: `${PRISM_APP_URL}${targetPath}` }, (tab) => {
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
          args: [storageKey, content, eventName],
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
    openPrismWithDocument(request.text, {
      source: request.source,
      title: request.title,
      url: request.url,
    });
    sendResponse({ ok: true });
  }
});
