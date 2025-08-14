'use server';
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const geminiApiKey = "AIzaSyCrgmvDSr3GlGAIL12EUGnWe2QBMBPQgbc";

if (!geminiApiKey) {
  throw new Error(
    'GEMINI_API_KEY has not been configured.'
  );
}

export const ai = genkit({
  plugins: [googleAI({apiKey: geminiApiKey})],
  model: 'googleai/gemini-2.0-flash',
});
