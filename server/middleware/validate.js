import { ApiError } from '../utils/ApiError.js';

/**
 * Validate req.body / req.params / req.query against Zod schemas.
 * Parsed (and coerced) values replace the originals.
 */
export const validate = (schemas) => (req, res, next) => {
  try {
    for (const key of ['body', 'params', 'query']) {
      if (!schemas[key]) continue;
      const result = schemas[key].safeParse(req[key]);
      if (!result.success) {
        const details = result.error.issues.map((issue) => ({
          field: issue.path.join('.') || key,
          message: issue.message,
        }));
        throw new ApiError(422, 'Please check the highlighted fields and try again.', 'VALIDATION_ERROR', details);
      }
      req[key] = result.data;
    }
    next();
  } catch (error) {
    next(error);
  }
};
