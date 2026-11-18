import { Progress } from '../models/Progress.js';
import { Roadmap } from '../models/Roadmap.js';
import { challenges } from '../data/challenges.js';
import { computeRoadmapStats } from '../utils/roadmap.js';
import { dayKey, daysBetween, lastNDays } from '../utils/date.js';

export const getOrCreateProgress = async (userId) => {
  // Atomic upsert prevents duplicate Progress documents (and Mongo E11000
  // errors) when two endpoints request progress at the same time.
  return Progress.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

const touchStreak = (progress, now = new Date()) => {
  if (!progress.lastActiveDate) {
    progress.learningStreak = 1;
  } else {
    const gap = daysBetween(progress.lastActiveDate, now);
    if (gap === 0) {
      progress.learningStreak = Math.max(progress.learningStreak, 1);
    } else if (gap === 1) {
      progress.learningStreak += 1;
    } else if (gap > 1) {
      progress.learningStreak = 1;
    }
  }

  progress.longestStreak = Math.max(progress.longestStreak, progress.learningStreak);
  progress.lastActiveDate = now;
};

const addActivity = (progress, activity) => {
  progress.activities.push({
    ...activity,
    date: activity.date || new Date(),
  });
  // Keep the history useful without letting the document grow forever.
  if (progress.activities.length > 40) {
    progress.activities = progress.activities.slice(-40);
  }
};

/**
 * Record a completed roadmap topic. Completing the same topic twice is a no-op.
 */
export async function recordTopicCompletion(userId, roadmap, phase, topic) {
  const progress = await getOrCreateProgress(userId);
  const alreadyDone = progress.completedTopics.some(
    (item) => item.topicId.toString() === topic._id.toString()
  );

  if (alreadyDone) {
    return { progress, alreadyDone: true };
  }

  const now = new Date();
  progress.completedTopics.push({
    roadmapId: roadmap._id,
    topicId: topic._id,
    title: topic.title,
    phaseTitle: phase.title,
    estimatedMinutes: topic.estimatedMinutes || 30,
    completedAt: now,
  });

  touchStreak(progress, now);
  addActivity(progress, {
    type: 'topic_completed',
    title: `Completed: ${topic.title}`,
    description: `${phase.title} • ${roadmap.title}`,
    minutes: topic.estimatedMinutes || 30,
    date: now,
  });

  await progress.save();
  return { progress, alreadyDone: false };
}

export async function removeTopicCompletion(userId, roadmap, topic) {
  const progress = await getOrCreateProgress(userId);
  const before = progress.completedTopics.length;
  progress.completedTopics = progress.completedTopics.filter(
    (item) => item.topicId.toString() !== topic._id.toString()
  );

  if (progress.completedTopics.length === before) {
    return { progress, changed: false };
  }

  addActivity(progress, {
    type: 'topic_reopened',
    title: `Reopened: ${topic.title}`,
    description: `Marked as not completed in ${roadmap.title}`,
    minutes: 0,
  });

  await progress.save();
  return { progress, changed: true };
}

/**
 * Award points once per challenge. The challenge content is static, so scores
 * cannot be manipulated by the client.
 */
export async function recordChallengeCompletion(userId, challenge) {
  const progress = await getOrCreateProgress(userId);
  const alreadyDone = progress.completedChallenges.some(
    (item) => item.challengeId === challenge.id
  );

  if (alreadyDone) {
    return { progress, alreadyDone: true, awarded: 0 };
  }

  const now = new Date();
  progress.completedChallenges.push({
    challengeId: challenge.id,
    title: challenge.title,
    difficulty: challenge.difficulty,
    score: challenge.points,
    completedAt: now,
  });
  progress.totalScore += challenge.points;

  touchStreak(progress, now);
  addActivity(progress, {
    type: 'challenge_completed',
    title: `Solved: ${challenge.title}`,
    description: `${challenge.difficulty} • ${challenge.topic} • +${challenge.points} points`,
    minutes: challenge.estimatedMinutes || 15,
    date: now,
  });

  await progress.save();
  return { progress, alreadyDone: false, awarded: challenge.points };
}

/**
 * Used for roadmap generation, project ideas and AI mentor sessions.
 */
export async function recordMilestone(userId, { type, title, description = '', minutes = 0 }) {
  const progress = await getOrCreateProgress(userId);
  touchStreak(progress);
  addActivity(progress, { type, title, description, minutes });
  await progress.save();
  return progress;
}

export async function getProgressSummary(user) {
  const [progress, roadmap] = await Promise.all([
    getOrCreateProgress(user._id),
    Roadmap.findOne({ userId: user._id, isActive: true }).sort({ createdAt: -1 }),
  ]);

  const roadmapStats = computeRoadmapStats(roadmap);
  const now = new Date();

  const streakIsCurrent =
    progress.lastActiveDate && daysBetween(progress.lastActiveDate, now) <= 1;
  const currentStreak = streakIsCurrent ? progress.learningStreak : 0;

  const today = dayKey(now);
  const todayActivities = progress.activities.filter((item) => dayKey(item.date) === today);
  const completedMinutesToday = todayActivities.reduce((sum, item) => sum + (item.minutes || 0), 0);

  const weeklyActivity = lastNDays(7).map((date) => {
    const key = dayKey(date);
    const dayActivities = progress.activities.filter((item) => dayKey(item.date) === key);
    return {
      date: key,
      label: date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
      activities: dayActivities.length,
      minutes: dayActivities.reduce((sum, item) => sum + (item.minutes || 0), 0),
      topics: dayActivities.filter((item) => item.type === 'topic_completed').length,
      challenges: dayActivities.filter((item) => item.type === 'challenge_completed').length,
    };
  });

  const challengePointsAvailable = challenges.reduce((sum, item) => sum + item.points, 0);
  const recentActivities = progress.activities.slice(-8).reverse();

  return {
    roadmap: {
      id: roadmap?._id || null,
      title: roadmap?.title || null,
      description: roadmap?.description || null,
      ...roadmapStats,
    },
    challenges: {
      completed: progress.completedChallenges.length,
      total: challenges.length,
      score: progress.totalScore,
      maxScore: challengePointsAvailable,
    },
    streak: {
      current: currentStreak,
      longest: progress.longestStreak,
      lastActiveDate: progress.lastActiveDate,
    },
    dailyGoal: {
      targetMinutes: user.dailyStudyTime,
      completedMinutes: completedMinutesToday,
      percent:
        user.dailyStudyTime > 0
          ? Math.min(100, Math.round((completedMinutesToday / user.dailyStudyTime) * 100))
          : 0,
    },
    weeklyActivity,
    recentActivities,
    hasRoadmap: Boolean(roadmap),
  };
}
