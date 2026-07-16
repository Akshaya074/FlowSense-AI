document.addEventListener('DOMContentLoaded', () => {
  const patInput = document.getElementById('patInput');
  const saveBtn = document.getElementById('saveBtn');
  const statusMsg = document.getElementById('statusMsg');

  // Load saved token from storage
  chrome.storage.local.get(['flowsensePat'], (result) => {
    if (result.flowsensePat) {
      patInput.value = result.flowsensePat;
    }
  });

  // Save token to storage
  saveBtn.addEventListener('click', () => {
    const pat = patInput.value.trim();
    chrome.storage.local.set({ flowsensePat: pat }, () => {
      statusMsg.style.display = 'block';
      setTimeout(() => {
        statusMsg.style.display = 'none';
      }, 2000);
    });
  });
});
