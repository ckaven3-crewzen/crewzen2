import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('DEBUG: GOOGLE_AI_API_KEY is', process.env.GOOGLE_AI_API_KEY);

// Check if we have the required API key
const apiKey = process.env.GOOGLE_AI_API_KEY;
if (!apiKey) {
  console.warn('GOOGLE_AI_API_KEY not found in environment variables. AI features will not work.');
}

export const ai = genkit({
  plugins: [googleAI({ apiKey })],
  model: 'googleai/gemini-2.0-flash',
});
