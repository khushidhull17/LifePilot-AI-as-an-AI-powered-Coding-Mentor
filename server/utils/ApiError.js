/**
 * A small error class used across the API so every response has a
 * predictable status code, message and optional machine-readable code.
 */
export class ApiError extends Error {
  constructor(statusCode, message, code = 'API_ERROR', details = undefined) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export const aiNotConfiguredError = () =>
  new ApiError(
    503,
    'AI features are not configured yet. Add GEMINI_API_KEY to server/.env and restart the server.',
    'AI_NOT_CONFIGURED'
  );
