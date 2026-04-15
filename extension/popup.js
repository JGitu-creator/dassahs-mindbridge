document.getElementById('simplifyBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const statusEl = document.getElementById('status');
  const btn = document.getElementById('simplifyBtn');

  statusEl.innerText = "Capturing text...";
  btn.style.opacity = "0.5";
  btn.disabled = true;

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: "extractText" });
    const text = response.text;

    if (!text) throw new Error("Could not find any readable text.");

    statusEl.innerText = "Refracting the Noise...";

    const encodedText = encodeURIComponent(text.slice(0, 3000));
    // ENSURING THE PRODUCTION URL IS USED
    const appUrl = `https://dassahs-prism.vercel.app/?text=${encodedText}`;
    
    chrome.tabs.create({ url: appUrl });
    window.close(); 

  } catch (err) {
    statusEl.innerText = "Error: " + err.message;
    btn.style.opacity = "1";
    btn.disabled = false;
  }
});
