import { asyncHandler } from '../utils/asyncHandler.js';
import { analyseCode } from '../services/debuggerService.js';

export const analyze = asyncHandler(async (req, res) => {
  const analysis = await analyseCode(req.body);
  res.json({ analysis });
});
