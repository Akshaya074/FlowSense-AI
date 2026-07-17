document.addEventListener('DOMContentLoaded', () => {
  const patInput = document.getElementById('patInput');
  const urlInput = document.getElementById('urlInput');
  const saveBtn = document.getElementById('saveBtn');
  const statusMsg = document.getElementById('statusMsg');

  // Load saved settings from storage
  chrome.storage.local.get(['flowsensePat', 'flowsenseUrl'], (result) => {
    if (result.flowsensePat) {
      patInput.value = result.flowsensePat;
    }
    if (result.flowsenseUrl) {
      urlInput.value = result.flowsenseUrl;
    }
  });

  // Save settings to storage
  saveBtn.addEventListener('click', () => {
    const pat = patInput.value.trim();
    const url = urlInput.value.trim();
    chrome.storage.local.set({ flowsensePat: pat, flowsenseUrl: url }, () => {
      statusMsg.style.display = 'block';
      setTimeout(() => {
        statusMsg.style.display = 'none';
      }, 2000);
    });
  });
});
