import { ApiError } from '../utils/ApiError.js';

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`, 'NOT_FOUND'));
};

/* eslint-disable no-unused-vars */
export const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Something went wrong.';
  let code = error.code || 'INTERNAL_ERROR';
  let details = error.details;

  if (error.name === 'ValidationError' && error.errors) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Please check the submitted data.';
    details = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  } else if (error.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = `Invalid value for ${error.path}.`;
  } else if (error.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    const field = Object.keys(error.keyValue || {})[0] || 'field';
    message = `An account or record with that ${field} already exists.`;
    details = undefined;
  } else if (error.type === 'entity.too.large') {
    statusCode = 413;
    code = 'PAYLOAD_TOO_LARGE';
    message = 'The request is too large. Please shorten your input.';
  }

  if (statusCode >= 500) {
    console.error(`[${code}]`, error);
  }

  res.status(statusCode).json({
    message,
    code,
    ...(details ? { details } : {}),
    ...(process.env.NODE_ENV !== 'production' && statusCode >= 500 ? { debug: error.message } : {}),
  });
};
