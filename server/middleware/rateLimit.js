import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import { env } from '../config/env.js';

const message = {
  message: 'Too many requests. Please slow down and try again in a few minutes.',
  code: 'RATE_LIMITED',
};

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Too many login attempts. Please wait a few minutes and try again.',
    code: 'AUTH_RATE_LIMITED',
  },
});

/**
 * AI calls cost money and can be abused, so authenticated users get a
 * smaller per-user budget. Falls back to IP for unauthenticated requests.
 */
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.aiRateLimit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => req.user?._id?.toString() || ipKeyGenerator(req.ip),
  message: {
    message: 'You have reached the AI request limit for now. Please try again later.',
    code: 'AI_RATE_LIMITED',
  },
});
