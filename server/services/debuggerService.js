import { generateJson } from './geminiService.js';
import { debuggerPrompt } from './prompts.js';
import { debuggerAnalysisSchema } from '../utils/schemas.js';

/**
 * Analyse code with Gemini. The code is only ever sent as text in a prompt:
 * LifePilot never executes user-submitted code on the server.
 */
export async function analyseCode({ code, language, errorMessage, question }) {
  const analysis = await generateJson({
    systemInstruction:
      'You are a patient debugging mentor. You never execute code. You explain bugs clearly, safely and without shaming the learner. Return only valid JSON.',
    prompt: debuggerPrompt({ code, language, errorMessage, question }),
    schema: debuggerAnalysisSchema,
    temperature: 0.35,
    maxOutputTokens: 6000,
  });

  return {
    ...analysis,
    language,
    analysedAt: new Date().toISOString(),
  };
}
