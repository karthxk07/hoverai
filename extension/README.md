# 🚀 hoverai

**hoverai** is a sleek, AI-powered Chrome extension that brings instant insights to your fingertips. Simply select any text on any webpage, and hoverai will provide the meaning, allowing you to dive deeper into the content without leaving your current tab.

## ✨ Features

- **Instant Meaning Lookup**: Highlight text to get an immediate AI-generated explanation.
- **Context-Aware AI**: Captures the overall page content to provide more accurate and contextually relevant meanings.
- **Integrated Chat Flow**: Ask follow-up questions directly from the popup. The extension copies your current context and question to the clipboard and redirects you to your favorite AI provider.
- **Customizable AI Providers**: Support for ChatGPT, Claude, Gemini, or any custom AI URL via the dashboard.
- **Modern UI/UX**: 
  - **Glassmorphism Design**: Beautifully blurred, transparent backgrounds.
  - **Theming**: Toggle between **Light** and **Dark** modes.
  - **Shadow DOM Isolation**: Ensures the popup's styles never clash with the website you're visiting.
  - **Non-Intrusive**: Intelligent character limits and a dedicated toggle to enable/disable the extension instantly.
- **Fast Access**: Toggle the extension on/off globally using a keyboard shortcut.

## 🛠️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- Google Chrome browser.

### Local Development
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd hoverai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```
   This will create a `dist` folder containing the bundled extension.

### Loading into Chrome
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **"Developer mode"** using the toggle in the top right corner.
3. Click **"Load unpacked"**.
4. Select the `dist` folder inside the project directory.

## 📖 How to Use

1. **Get a Meaning**: Highlight any word or short phrase on a webpage. The `hoverai` popup will appear instantly with the meaning.
2. **Ask a Question**: Type a follow-up question in the "Ask..." input at the bottom of the popup.
3. **Redirect to AI**: Click the send button. The extension will:
   - Copy the context and your question to your clipboard.
   - Show a toast notification.
   - Redirect you to your configured AI provider after 3 seconds.

## ⚙️ Configuration

Access the **hoverai Dashboard** by clicking the extension icon in the Chrome toolbar.

- **Enabled Toggle**: Turn the extension on or off.
- **Theme**: Switch between Dark and Light modes.
- **AI Provider**: Choose between ChatGPT, Claude, Gemini, or input a Custom URL.
- **Instant Save**: All changes are applied automatically without needing to hit a save button.

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + Shift + Y` (Win/Linux) | Toggle Extension On/Off |
| `Cmd + Shift + Y` (Mac) | Toggle Extension On/Off |

## 🛠️ Technical Stack

- **Frontend**: JavaScript (ES6+), CSS3 (Variables, Backdrop Filter)
- **Build Tool**: [Vite](https://vitejs.dev/) with `@crxjs/vite-plugin`
- **API**: Chrome Extensions API (Manifest V3)
- **Storage**: `chrome.storage.local`

## 🚀 Future Roadmap
- [ ] Replace mock AI logic with a real LLM API integration.
- [ ] Implement advanced page-summarization for better context.
- [ la ] Add a history of looked-up words.
