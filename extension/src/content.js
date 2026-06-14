import styles from './style.css?inline'
import { fetchMeaning } from './api.js'

function showToast(message, theme) {
  const toast = document.createElement('div');
  toast.id = 'hoverai-toast';
  toast.textContent = message;

  // Theme-based styling for toast
  Object.assign(toast.style, {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '10px 20px',
    borderRadius: '12px',
    zIndex: '1000000',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '13px',
    fontWeight: '500',
    color: 'white',
    transition: 'opacity 0.3s, transform 0.3s',
    pointerEvents: 'none',
    opacity: '0',
    transform: 'translateX(-50%) translateY(-10px)'
  });

  // Apply theme colors to toast
  const themeColors = {
    dark: { bg: 'rgba(20, 20, 22, 0.8)', border: 'rgba(255, 255, 255, 0.1)' },
    light: { bg: 'rgba(245, 245, 247, 0.9)', border: 'rgba(0, 0, 0, 0.1)', text: 'rgba(0, 0, 0, 0.8)' },
    glass: { bg: 'rgba(255, 255, 255, 0.3)', border: 'rgba(255, 255, 255, 0.2)' }
  };

  const colors = themeColors[theme] || themeColors.dark;
  toast.style.background = colors.bg;
  toast.style.border = `1px solid ${colors.border}`;
  if (colors.text) toast.style.color = colors.text;
  toast.style.backdropFilter = 'blur(10px)';

  document.body.appendChild(toast);

  // Fade in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  // Fade out and remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

document.addEventListener("mouseup", async (event) => {
  const host = document.getElementById("hoverai-host");
  if (host && (host.contains(event.target) || event.composedPath().includes(host))) {
    return;
  }

  // Always remove existing popup on any click outside the popup
  removeExistingPopup();

  // Check if enabled
  const settings = await chrome.storage.local.get(['enabled', 'theme', 'aiProvider', 'customUrl']);
  if (settings.enabled === false) return;

  const text = window.getSelection().toString().trim();

  // Only process if text length is within reasonable limit (~1-1.5 lines)
  if (!text || text.length > 120) return;

  const range = window.getSelection().getRangeAt(0);
  const rect = range.getBoundingClientRect();

  const popupHost = document.createElement('div');
  popupHost.id = "hoverai-host"
  document.body.appendChild(popupHost);

  const shadowRoot = popupHost.attachShadow({ mode: 'open' })

  // Set theme attribute
  const theme = settings.theme || 'dark';

  const style = document.createElement('style');
  style.textContent = styles;
  shadowRoot.appendChild(style)

  const popup = document.createElement("div");
  popup.id = "ai-popup";
  popup.setAttribute('data-theme', theme);

  popup.innerHTML = `
  <div class="popup-title">hoverai.</div>
  <div class="popup-body">
    <div class="popup-header">
      <span class="selected-text">"${text}"</span>
    </div>
    <div class="meaning-box">
      Meaning of the text
    </div>
  </div>
  <div class="chat-panel">
    <div class="chat-input-row">
      <input
        type="text"
        class="chat-input"
        placeholder="Ask..."
        autocomplete="off"
      />
      <button class="chat-send-btn" type="button" aria-label="Send">
        <svg class="send-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
`
  shadowRoot.appendChild(popup);

  popup.style.top = `${rect.bottom + window.scrollY + 15}px`;
  popup.style.left = `${rect.left + window.scrollX}px`;

  const meaningBox = popup.querySelector('.meaning-box');
  let currentMeaning = '';

  if (meaningBox) {
    meaningBox.textContent = 'Thinking...';
    try {
      // Build context from page content
      const pageContext = document.body.innerText;

      // Store context in memory for this session/page
      await chrome.storage.local.set({ lastPageContext: pageContext });

      const meaning = await chrome.runtime.sendMessage({
        type: 'FETCH_MEANING',
        payload: { context: pageContext, selected_word: text }
      });
      meaningBox.textContent = meaning;
    } catch (error) {
      console.error('Error fetching meaning:', error);
      meaningBox.textContent = 'Failed to fetch meaning. Please try again.';
    }
  }

  const sendBtn = popup.querySelector('.chat-send-btn');
  const chatInput = popup.querySelector('.chat-input');

  sendBtn.addEventListener('click', async () => {
    const question = chatInput.value.trim();
    if (!question) return;

    const formattedText = `${currentMeaning}\n//\n${question}`;

    try {
      await navigator.clipboard.writeText(formattedText);

      // Determine URL
      let aiUrl = settings.aiProvider || 'https://chatgpt.com';
      if (aiUrl === 'custom') aiUrl = settings.customUrl || 'https://chatgpt.com';

      showToast(`Copied to clipboard, redirecting to ${aiUrl.replace('https://', '').split('/')[0]} in 3 seconds...`, theme);

      setTimeout(() => {
        window.open(aiUrl, '_blank');
      }, 3000);
    } catch (err) {
      console.error('Clipboard error:', err);
    }
  });
});

function removeExistingPopup() {
  document.getElementById("hoverai-host")?.remove();
}

// Listen for settings changes to remove popup instantly when disabled
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.enabled && changes.enabled.newValue === false) {
    removeExistingPopup();
  }
});
