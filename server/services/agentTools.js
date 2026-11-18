import { getProgressSummary } from './progressService.js';

/**
 * A compact snapshot that is safe to hand to the AI model. It contains only
 * the current learner's data and never exposes other users' records.
 */
export async function calculateProgressSnapshot(user) {
  const summary = await getProgressSummary(user);

  return {
    learner: {
      name: user.name,
      level: user.skillLevel,
      track: user.preferredLanguage,
      goal: user.learningGoal || null,
      dailyMinutes: user.dailyStudyTime,
    },
    roadmap: {
      title: summary.roadmap.title,
      completionPercent: summary.roadmap.completionPercent,
      completedTopics: summary.roadmap.completedTopics,
      pendingTopics: summary.roadmap.pendingTopics,
      totalTopics: summary.roadmap.totalTopics,
    },
    nextTask: summary.roadmap.nextTopic
      ? {
          topicId: summary.roadmap.nextTopic.topicId,
          title: summary.roadmap.nextTopic.title,
          phase: summary.roadmap.nextTopic.phaseTitle,
          estimatedMinutes: summary.roadmap.nextTopic.estimatedMinutes,
          explanation: summary.roadmap.nextTopic.explanation,
          miniProject: summary.roadmap.nextTopic.miniProject,
        }
      : null,
    streak: summary.streak,
    dailyGoal: summary.dailyGoal,
    challenges: summary.challenges,
    recentActivity: summary.recentActivities.slice(0, 3).map((item) => ({
      title: item.title,
      type: item.type,
      date: item.date,
    })),
  };
}
