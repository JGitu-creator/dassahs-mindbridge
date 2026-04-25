document.getElementById('simplifyBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const statusEl = document.getElementById('status');
  const btn = document.getElementById('simplifyBtn');

  statusEl.innerText = "Capturing Noise...";
  btn.style.opacity = "0.5";
  btn.disabled = true;

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: "extractText" });
    const text = response.text;

    if (!text) throw new Error("Noise not found.");

    statusEl.innerText = "Refracting Web...";

    const encodedText = encodeURIComponent(text.slice(0, 3000));
    const appUrl = `https://dassahs-mindbridge.vercel.app/?text=${encodedText}`;
    
    chrome.tabs.create({ url: appUrl });
    window.close(); 

  } catch (err) {
    if (err.message.includes("Could not establish connection")) {
      statusEl.innerText = "Please refresh the page to sync.";
      statusEl.style.color = "#3b82f6";
    } else {
      statusEl.innerText = "Error: " + err.message;
    }
    btn.style.opacity = "1";
    btn.disabled = false;
  }
});
