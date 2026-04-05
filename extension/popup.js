document.getElementById('simplifyBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const statusEl = document.getElementById('status');
  const btn = document.getElementById('simplifyBtn');

  statusEl.innerText = "Capturing text...";
  btn.disabled = true;

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: "extractText" });
    const text = response.text;

    if (!text) throw new Error("Could not find any readable text on this page.");

    statusEl.innerText = "Simplifying with AI...";

    const encodedText = encodeURIComponent(text.slice(0, 3000));
    // Updated to use the Cloud Shell URL instead of localhost
    const appUrl = `https://3000-cs-f06254f1-44e4-4f26-820c-02f0a6c124b7.cs-europe-west1-onse.cloudshell.dev/?text=${encodedText}`;
    
    chrome.tabs.create({ url: appUrl });
    window.close(); 

  } catch (err) {
    statusEl.innerText = "Error: " + err.message;
    btn.disabled = false;
  }
});
