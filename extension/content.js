// NOISE DETECTION ALGORITHM
const checkNoiseLevel = () => {
  const text = document.body.innerText;
  const wordCount = text.split(/\s+/).length;
  
  // If more than 800 words, it's a "Noisy" page
  if (wordCount > 800) {
    console.log("Dassah's Prism: High Noise detected. Consider refracting.");
    // We could inject a small UI element here to suggest refraction
  }
};

// Delay check to allow page to load
setTimeout(checkNoiseLevel, 2000);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractText") {
    // Basic extraction: get all visible text in the body
    const text = document.body.innerText;
    sendResponse({ text: text.slice(0, 8000) }); // Increased limit
    return false; // Sync response
  }
  sendResponse({});
  return false;
});
