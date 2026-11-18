import { GoogleGenAI } from '@google/genai';
import { env } from './env.js';
import { ApiError } from '../utils/ApiError.js';

let client = null;

/**
 * Create the Gemini client lazily so the API can still start without a key.
 * AI routes return a clear setup message when the key is missing.
 */
export function getGeminiClient() {
  if (!env.geminiApiKey) {
    throw new ApiError(
      503,
      'AI features are not configured yet. Add GEMINI_API_KEY to server/.env and restart the server.',
      'AI_NOT_CONFIGURED'
    );
  }

  if (!client) {
    client = new GoogleGenAI({ apiKey: env.geminiApiKey });
  }

  return client;
}

export function resetGeminiClient() {
  client = null;
}
