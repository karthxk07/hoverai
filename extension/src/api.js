/**
 * Fetches the meaning of the selected text by calling the backend server API.
 * The server then calls an LLM with the context and word to get the meaning.
 *
 * @param {Object} request The request object containing context and selected_word.
 * @returns {Promise<string>} The AI-generated meaning from the server.
 */
export async function fetchMeaning({ context, selected_word }) {
  // Get server URL from storage (default to localhost for development)
  const settings = await chrome.storage.local.get(['serverUrl']);
  const serverUrl = settings.serverUrl || 'http://localhost:3000';

  const endpoint = `${serverUrl}/get-meaning`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        selected_word,
        context: context || ''
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.meaning || 'No meaning returned from server';
  } catch (error) {
    console.error('Error fetching meaning from server:', error);
    // Return a user-friendly error message
    return `Failed to fetch meaning: ${error.message}`;
  }
}

/**
 * Check if the server is reachable
 * @returns {Promise<boolean>}
 */
export async function checkServerHealth() {
  const settings = await chrome.storage.local.get(['serverUrl']);
  const serverUrl = settings.serverUrl || 'http://localhost:3000';

  try {
    const response = await fetch(`${serverUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });
    return response.ok;
  } catch {
    return false;
  }
}
