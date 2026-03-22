
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const plugins: any[] = [];
const apiKey = process.env.GEMINI_API_KEY;

// This is a more robust check. A real Google AI API key has a specific length (39 chars) 
// and doesn't contain placeholders. This prevents crashes from invalid or placeholder keys.
const isApiKeyValid = apiKey && apiKey.trim().length === 39 && !apiKey.includes('YOUR_GEMINI_API_KEY');

if (isApiKeyValid) {
  plugins.push(googleAI({apiKey}));
} else {
  console.warn(
    `\n🚨 GenAI features disabled. The GEMINI_API_KEY is missing or invalid. To enable, please get a free API key from Google AI Studio (https://aistudio.google.com/app/apikey) and add it to your .env file as GEMINI_API_KEY=YOUR_API_KEY\n`
  );
}

export const ai = genkit({
  plugins,
  // The model specified here is a default and can be overridden in individual prompts.
  // We use gemini-pro as it is a stable and widely available model.
  model: 'googleai/gemini-2.5-flash',
});
