import { asyncHandler } from '../utils/asyncHandler.js';
import { generateRoadmap, getRoadmapView, setTopicCompletion } from '../services/roadmapService.js';
import { isAiConfigured } from '../config/env.js';

export const getRoadmap = asyncHandler(async (req, res) => {
  const view = await getRoadmapView(req.user);
  res.json({ ...view, aiConfigured: isAiConfigured() });
});

export const createRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await generateRoadmap(req.user, req.body || {});
  res.status(201).json({ roadmap });
});

export const updateTopic = asyncHandler(async (req, res) => {
  const result = await setTopicCompletion(req.user, req.params.topicId, req.body.completed);
  res.json(result);
});
