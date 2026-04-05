chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractText") {
    // Basic extraction: get all visible text in the body
    const text = document.body.innerText;
    sendResponse({ text: text.slice(0, 5000) }); // Limit to 5k characters for now
  }
  return true;
});
