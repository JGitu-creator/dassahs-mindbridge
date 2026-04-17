chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractText") {
    // Basic extraction: get all visible text in the body
    const text = document.body.innerText;
    sendResponse({ text: text.slice(0, 5000) });
    return false; // Sync response
  }
  sendResponse({});
  return false;
});
