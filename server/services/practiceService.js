import { challenges, challengeById } from '../data/challenges.js';
import { ApiError } from '../utils/ApiError.js';
import { getOrCreateProgress, recordChallengeCompletion } from './progressService.js';

const withoutSolution = (challenge) => {
  const { solution, explanation, ...rest } = challenge;
  return rest;
};

export async function listChallenges(userId, { difficulty, topic, language } = {}, existingProgress = null) {
  const progress = existingProgress || (await getOrCreateProgress(userId));
  const completedIds = new Set(progress.completedChallenges.map((item) => item.challengeId));

  return challenges
    .filter((challenge) => !difficulty || challenge.difficulty === difficulty)
    .filter((challenge) => !topic || challenge.topic === topic)
    .filter((challenge) => !language || challenge.language === language)
    .map((challenge) => ({
      ...withoutSolution(challenge),
      completed: completedIds.has(challenge.id),
    }));
}

export async function getChallenge(userId, challengeId) {
  const challenge = challengeById.get(challengeId);
  if (!challenge) throw new ApiError(404, 'Challenge not found.', 'CHALLENGE_NOT_FOUND');

  const progress = await getOrCreateProgress(userId);
  const completed = progress.completedChallenges.some((item) => item.challengeId === challengeId);

  return {
    ...withoutSolution(challenge),
    completed,
    // Solutions stay hidden until the learner marks the challenge as complete.
    ...(completed ? { solution: challenge.solution, explanation: challenge.explanation } : {}),
  };
}

export async function completeChallenge(userId, challengeId) {
  const challenge = challengeById.get(challengeId);
  if (!challenge) throw new ApiError(404, 'Challenge not found.', 'CHALLENGE_NOT_FOUND');

  const { progress, alreadyDone, awarded } = await recordChallengeCompletion(userId, challenge);

  return {
    completed: true,
    alreadyDone,
    awarded,
    totalScore: progress.totalScore,
    solution: challenge.solution,
    explanation: challenge.explanation,
  };
}

export async function getPracticeMeta(userId, existingProgress = null) {
  const progress = existingProgress || (await getOrCreateProgress(userId));
  const completedIds = new Set(progress.completedChallenges.map((item) => item.challengeId));
  const byDifficulty = { beginner: 0, intermediate: 0, advanced: 0 };

  challenges.forEach((challenge) => {
    byDifficulty[challenge.difficulty] += 1;
  });

  return {
    total: challenges.length,
    completed: completedIds.size,
    score: progress.totalScore,
    byDifficulty,
    topics: [...new Set(challenges.map((challenge) => challenge.topic))].sort(),
    languages: [...new Set(challenges.map((challenge) => challenge.language))].sort(),
  };
}
