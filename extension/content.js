// NOISE DETECTION ALGORITHM
const checkNoiseLevel = () => {
  const text = document.body.innerText;
  const wordCount = text.split(/\s+/).length;
  
  // If more than 800 words, it's a "Noisy" page
  if (wordCount > 800) {
    console.log("Dassah's Prism: High Noise detected. Consider refracting.");
    chrome.runtime.sendMessage({ action: "showNoiseAlert", wordCount });
    injectPrismAlert(wordCount);
  }
};

const injectPrismAlert = (wordCount) => {
  // Prevent duplicate alerts
  if (document.getElementById('dassahs-prism-alert')) return;

  const alertDiv = document.createElement('div');
  alertDiv.id = 'dassahs-prism-alert';
  alertDiv.innerHTML = `
    <div class="prism-alert-pulse"></div>
    <div class="prism-alert-icon">DP</div>
    <div class="prism-alert-tooltip">High Noise Detected (${wordCount} words). Click to Refract.</div>
  `;

  // Inject Styles
  const style = document.createElement('style');
  style.textContent = `
    #dassahs-prism-alert {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 60px;
      height: 60px;
      z-index: 2147483647;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Inter', system-ui, sans-serif;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .prism-alert-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      border-radius: 14px;
      color: white;
      font-weight: 900;
      font-style: italic;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      z-index: 2;
    }

    .prism-alert-pulse {
      position: absolute;
      width: 50px;
      height: 50px;
      background: #3b82f6;
      border-radius: 14px;
      opacity: 0.5;
      animation: prism-pulse 2s infinite;
      z-index: 1;
    }

    @keyframes prism-pulse {
      0% { transform: scale(1); opacity: 0.5; }
      70% { transform: scale(1.6); opacity: 0; }
      100% { transform: scale(1); opacity: 0; }
    }

    .prism-alert-tooltip {
      position: absolute;
      right: 70px;
      background: rgba(15, 23, 42, 0.9);
      backdrop-blur: 10px;
      color: white;
      padding: 10px 16px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      opacity: 0;
      transform: translateX(10px);
      transition: all 0.3s ease;
      pointer-events: none;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    }

    #dassahs-prism-alert:hover .prism-alert-tooltip {
      opacity: 1;
      transform: translateX(0);
    }

    #dassahs-prism-alert:hover .prism-alert-icon {
      transform: scale(1.1);
      filter: brightness(1.1);
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(alertDiv);

  alertDiv.addEventListener('click', () => {
    const text = document.body.innerText;
    // v1.4.0: sessionStorage handoff instead of URL params (handled by background.js)
    chrome.runtime.sendMessage({ action: "openPrismWithDocument", text });
    alertDiv.style.opacity = '0';
    setTimeout(() => alertDiv.remove(), 500);
  });
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
