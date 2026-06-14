const express = require('express');
const cors = require('cors');
// Using native fetch (Node 18+)

const app = express();
const PORT = process.env.PORT || 3000;

// LLM Configuration - can be set via environment variables
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'gemini'; // 'openai', 'anthropic', 'gemini', 'custom'
const LLM_API_KEY = process.env.LLM_API_KEY; // Set via .env file
const LLM_MODEL = process.env.LLM_MODEL || 'gemini-2.5-flash-lite';
const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('hoverai Server is running!');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', provider: LLM_PROVIDER, model: LLM_MODEL });
});

/**
 * Build the prompt for getting word meaning in context
 * Limits context to ~0.5-1 lines (roughly 100-200 chars) and defines tone
 */
function buildPrompt({ selected_word, context }) {
  // Limit context to ~150 characters (roughly 0.5-1 lines)
  const MAX_CONTEXT_LENGTH = 150;
  let trimmedContext = context;

  if (context && context.length > MAX_CONTEXT_LENGTH) {
    // Try to cut at a word boundary
    const cutoff = context.lastIndexOf(' ', MAX_CONTEXT_LENGTH);
    trimmedContext = cutoff > 50 ? context.substring(0, cutoff) + '...' : context.substring(0, MAX_CONTEXT_LENGTH) + '...';
  }

  const prompt = `You are a helpful dictionary assistant. Define the meaning of the selected word/phrase in the given context.

SELECTED WORD: "${selected_word}"

CONTEXT (max ~1 line): "${trimmedContext || 'No context provided'}"

REQUIREMENTS:
- Provide a concise definition (1-2 sentences max)
- Focus on the meaning SPECIFIC to this context
- Tone: Clear, helpful, slightly conversational but professional
- Do NOT provide etymology, pronunciation, or multiple definitions unless context demands it
- If the context is insufficient, give the most likely general meaning

Respond with ONLY the definition, no extra commentary or formatting.`;

  return prompt;
}

/**
 * Call the LLM API based on configured provider
 */
async function callLLM(prompt) {
  if (!LLM_API_KEY) {
    throw new Error('LLM_API_KEY not configured. Please set the LLM_API_KEY environment variable.');
  }

  let response;

  switch (LLM_PROVIDER) {
    case 'openai':
      response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LLM_API_KEY}`
        },
        body: JSON.stringify({
          model: LLM_MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 150
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${error}`);
      }

      const openaiData = await response.json();
      return openaiData.choices?.[0]?.message?.content?.trim() || 'No response from AI';

    case 'anthropic':
      response = await fetch(`${LLM_BASE_URL}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': LLM_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: LLM_MODEL,
          max_tokens: 150,
          temperature: 0.3,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Anthropic API error: ${response.status} - ${error}`);
      }

      const anthropicData = await response.json();
      return anthropicData.content?.[0]?.text?.trim() || 'No response from AI';

    case 'gemini':
      // Google Gemini API
      response = await fetch(`${LLM_BASE_URL}/models/${LLM_MODEL}:generateContent?key=${LLM_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 150,
          }
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${error}`);
      }

      const geminiData = await response.json();
      return geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'No response from AI';

    case 'custom':
      // Custom endpoint - expects OpenAI-compatible format
      response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LLM_API_KEY}`
        },
        body: JSON.stringify({
          model: LLM_MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 150
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Custom API error: ${response.status} - ${error}`);
      }

      const customData = await response.json();
      return customData.choices?.[0]?.message?.content?.trim() || 'No response from AI';

    default:
      throw new Error(`Unknown LLM provider: ${LLM_PROVIDER}`);
  }
}

// This will be the endpoint used by the extension's fetchMeaning
app.post('/get-meaning', async (req, res) => {
  const { selected_word, context } = req.body;

  if (!selected_word) {
    return res.status(400).json({ error: 'Missing selected_word' });
  }

  console.log(`Fetching meaning for: "${selected_word}"`);
  console.log(`Context length: ${context ? context.length : 0} chars`);

  try {
    const prompt = buildPrompt({ selected_word, context });
    const meaning = await callLLM(prompt);

    console.log(`Meaning: ${meaning.substring(0, 100)}...`);
    res.json({ meaning });
  } catch (error) {
    console.error('Error fetching meaning:', error.message);

    // Return a helpful error message to the extension
    res.status(500).json({
      error: 'Failed to fetch meaning',
      details: error.message,
      // Fallback: provide a generic response
      meaning: `Unable to get AI definition for "${selected_word}". Please check server configuration.`
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 hoverai server running on http://localhost:${PORT}`);
  console.log(`   LLM Provider: ${LLM_PROVIDER}`);
  console.log(`   Model: ${LLM_MODEL}`);
  console.log(`   API Key: ${LLM_API_KEY ? 'Configured' : 'NOT SET - Set LLM_API_KEY env var'}`);
});
