/**
 * Gemini sometimes wraps JSON in markdown fences or adds a sentence around it.
 * This helper extracts the first valid JSON object/array in a safe way.
 */
export function parseJsonFromText(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('The AI returned an empty response.');
  }

  let cleaned = text.trim();
  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) cleaned = fenced[1].trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try the outermost object or array if the model added commentary.
    const candidates = [];
    const objectStart = cleaned.indexOf('{');
    const objectEnd = cleaned.lastIndexOf('}');
    const arrayStart = cleaned.indexOf('[');
    const arrayEnd = cleaned.lastIndexOf(']');

    if (objectStart !== -1 && objectEnd > objectStart) {
      candidates.push(cleaned.slice(objectStart, objectEnd + 1));
    }
    if (arrayStart !== -1 && arrayEnd > arrayStart) {
      candidates.push(cleaned.slice(arrayStart, arrayEnd + 1));
    }

    for (const candidate of candidates) {
      try {
        return JSON.parse(candidate);
      } catch {
        // Keep trying.
      }
    }
  }

  throw new Error('The AI returned an invalid JSON response.');
}
