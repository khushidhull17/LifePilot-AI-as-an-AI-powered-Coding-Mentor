import { asyncHandler } from '../utils/asyncHandler.js';
import { getProgressSummary } from '../services/progressService.js';
import { isAiConfigured } from '../config/env.js';

export const getSummary = asyncHandler(async (req, res) => {
  const summary = await getProgressSummary(req.user);
  res.json({ ...summary, aiConfigured: isAiConfigured() });
});
