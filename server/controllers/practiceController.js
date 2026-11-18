import { asyncHandler } from '../utils/asyncHandler.js';
import {
  completeChallenge,
  getChallenge,
  getPracticeMeta,
  listChallenges,
} from '../services/practiceService.js';
import { getOrCreateProgress } from '../services/progressService.js';

export const getChallenges = asyncHandler(async (req, res) => {
  const progress = await getOrCreateProgress(req.user._id);
  const [challenges, meta] = await Promise.all([
    listChallenges(req.user._id, req.query, progress),
    getPracticeMeta(req.user._id, progress),
  ]);
  res.json({ challenges, meta });
});

export const getOneChallenge = asyncHandler(async (req, res) => {
  const challenge = await getChallenge(req.user._id, req.params.challengeId);
  res.json({ challenge });
});

export const markChallengeComplete = asyncHandler(async (req, res) => {
  const result = await completeChallenge(req.user._id, req.params.challengeId);
  res.json(result);
});
