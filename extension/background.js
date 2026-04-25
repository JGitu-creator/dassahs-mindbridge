chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "refractSelection",
    title: "Refract into Dassah's Prism",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "refractSelection" && info.selectionText) {
    const encodedText = encodeURIComponent(info.selectionText);
    // USING PRODUCTION URL (Default fallback to localhost)
    const appUrl = `https://dassahs-mindbridge-rjeiohdc3-phidotaxis-3372s-projects.vercel.app/?text=${encodedText}`;
    chrome.tabs.create({ url: appUrl });
  }
});

// Listener for messages from content scripts
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
});
