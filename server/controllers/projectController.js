import { asyncHandler } from '../utils/asyncHandler.js';
import {
  generateProjectRecommendations,
  getLatestRecommendations,
} from '../services/projectService.js';
import { isAiConfigured } from '../config/env.js';

export const getLatest = asyncHandler(async (req, res) => {
  const recommendation = await getLatestRecommendations(req.user._id);
  res.json({ recommendation, aiConfigured: isAiConfigured() });
});

export const recommend = asyncHandler(async (req, res) => {
  const recommendation = await generateProjectRecommendations(
    req.user,
    req.body?.count || 3
  );
  res.status(201).json({ recommendation });
});
