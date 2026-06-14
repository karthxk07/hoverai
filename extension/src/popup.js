document.addEventListener('DOMContentLoaded', async () => {
  const enabledToggle = document.getElementById('enabled-toggle');
  const themeSelect = document.getElementById('theme-select');
  const aiSelect = document.getElementById('ai-select');
  const customUrlInput = document.getElementById('custom-url');
  const serverUrlInput = document.getElementById('server-url');

  // Load settings
  const settings = await chrome.storage.local.get(['enabled', 'theme', 'aiProvider', 'customUrl']);

  enabledToggle.checked = settings.enabled !== false; // Default to true
  themeSelect.value = settings.theme || 'dark';
  aiSelect.value = settings.aiProvider || 'https://chatgpt.com';
  customUrlInput.value = settings.customUrl || '';

  if (aiSelect.value === 'custom') {
    customUrlInput.classList.remove('hidden');
  }

  const updateSettings = async () => {
    const updatedSettings = {
      enabled: enabledToggle.checked,
      theme: themeSelect.value,
      aiProvider: aiSelect.value,
      customUrl: customUrlInput.value
    };
    await chrome.storage.local.set(updatedSettings);
  };

  enabledToggle.addEventListener('change', updateSettings);
  themeSelect.addEventListener('change', updateSettings);
  aiSelect.addEventListener('change', () => {
    if (aiSelect.value === 'custom') {
      customUrlInput.classList.remove('hidden');
    } else {
      customUrlInput.classList.add('hidden');
    }
    updateSettings();
  });
  customUrlInput.addEventListener('input', updateSettings);
  serverUrlInput.addEventListener('input', updateSettings);
});
