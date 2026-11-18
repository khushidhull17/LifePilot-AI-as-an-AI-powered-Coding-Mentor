import { env } from '../config/env.js';
import { getGeminiClient } from '../config/gemini.js';
import { ApiError } from '../utils/ApiError.js';
import { parseJsonFromText } from '../utils/parseJson.js';

export function mapGeminiError(error) {
  if (error instanceof ApiError) return error;

  const message = String(error?.message || '');
  console.error('Gemini request failed:', message);

  if (/api key|unauthenticated|permission denied|403|401/i.test(message)) {
    return new ApiError(
      503,
      'The Gemini API key was rejected. Check GEMINI_API_KEY in server/.env and restart the server.',
      'AI_AUTH_FAILED'
    );
  }
  if (/429|quota|rate limit/i.test(message)) {
    return new ApiError(
      429,
      'The AI service is busy or the API quota is used up. Please wait a moment and try again.',
      'AI_BUSY'
    );
  }
  if (/404|model/i.test(message)) {
    return new ApiError(
      502,
      `The AI model "${env.geminiModel}" could not be used. Check GEMINI_MODEL in server/.env.`,
      'AI_MODEL_ERROR'
    );
  }
  if (/timeout|deadline|ETIMEDOUT/i.test(message)) {
    return new ApiError(504, 'The AI took too long to respond. Please try again.', 'AI_TIMEOUT');
  }

  return new ApiError(
    502,
    'The AI service could not complete the request. Please try again in a moment.',
    'AI_ERROR'
  );
}

const baseConfig = {
  temperature: 0.65,
  maxOutputTokens: 4096,
};

export async function generateText({
  systemInstruction,
  contents,
  temperature = baseConfig.temperature,
  maxOutputTokens = baseConfig.maxOutputTokens,
}) {
  const ai = getGeminiClient();

  try {
    const response = await ai.models.generateContent({
      model: env.geminiModel,
      contents,
      config: {
        systemInstruction,
        temperature,
        maxOutputTokens,
      },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new ApiError(502, 'The AI returned an empty response. Please try again.', 'AI_EMPTY_RESPONSE');
    }
    return text;
  } catch (error) {
    throw mapGeminiError(error);
  }
}

/**
 * Ask Gemini for JSON, parse it and validate it with a Zod schema.
 * One repair attempt is made if the model returns malformed output.
 */
export async function generateJson({
  systemInstruction,
  prompt,
  schema,
  temperature = 0.45,
  maxOutputTokens = 6000,
}) {
  let firstError = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const repairNote =
      attempt === 0
        ? ''
        : '\n\nYour previous answer could not be parsed as valid JSON for the required shape. Return corrected JSON only. No markdown. No explanation.';

    const text = await generateText({
      systemInstruction,
      contents: `${prompt}${repairNote}`,
      temperature: attempt === 0 ? temperature : 0.2,
      maxOutputTokens,
    });

    try {
      const parsed = parseJsonFromText(text);
      return schema.parse(parsed);
    } catch (error) {
      firstError = error;
      console.warn(`AI JSON attempt ${attempt + 1} failed:`, error.message);
    }
  }

  throw new ApiError(
    502,
    'The AI returned data in an unexpected format. Please try again.',
    'AI_INVALID_RESPONSE',
    process.env.NODE_ENV !== 'production' ? { reason: firstError?.message } : undefined
  );
}

/**
 * Multi-turn mentor chat. History is replayed as model/user turns and the
 * latest learner message is appended.
 */
export async function generateChatReply({ systemInstruction, history = [], message }) {
  const contents = [
    ...history.map((item) => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: item.content }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ];

  return generateText({
    systemInstruction,
    contents,
    temperature: 0.72,
    maxOutputTokens: 3072,
  });
}
