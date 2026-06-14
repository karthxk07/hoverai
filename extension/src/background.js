import { fetchMeaning } from "./api";

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-extension') {
    const settings = await chrome.storage.local.get(['enabled']);
    const newState = settings.enabled === undefined ? false : !settings.enabled;

    await chrome.storage.local.set({ enabled: newState });

    // Optional: Notify user via a badge or simple console log
    console.log(`hoverai is now ${newState ? 'Enabled' : 'Disabled'}`);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FETCH_MEANING') {
    console.log("fetching message")
    fetchMeaning(message.payload).then(sendResponse);
    return true; // keeps the message channel open for async response
  }
});
