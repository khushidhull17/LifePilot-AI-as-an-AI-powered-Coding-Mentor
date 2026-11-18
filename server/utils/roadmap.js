/**
 * Helpers for calculating roadmap progress in one place.
 * Kept separate from controllers so it can be tested easily.
 */
export function flattenTopics(roadmap) {
  if (!roadmap?.phases) return [];
  return roadmap.phases.flatMap((phase, phaseIndex) =>
    phase.topics.map((topic, topicIndex) => ({ topic, phase, phaseIndex, topicIndex }))
  );
}

export function computeRoadmapStats(roadmap) {
  const entries = flattenTopics(roadmap);
  const totalTopics = entries.length;
  const completed = entries.filter(({ topic }) => topic.completed);
  const next = entries.find(({ topic }) => !topic.completed) || null;
  const totalMinutes = entries.reduce((sum, { topic }) => sum + (topic.estimatedMinutes || 0), 0);
  const completedMinutes = completed.reduce((sum, { topic }) => sum + (topic.estimatedMinutes || 0), 0);

  return {
    totalTopics,
    completedTopics: completed.length,
    pendingTopics: totalTopics - completed.length,
    completionPercent: totalTopics === 0 ? 0 : Math.round((completed.length / totalTopics) * 100),
    totalMinutes,
    completedMinutes,
    remainingMinutes: Math.max(totalMinutes - completedMinutes, 0),
    nextTopic: next
      ? {
          topicId: next.topic._id.toString(),
          title: next.topic.title,
          explanation: next.topic.explanation,
          estimatedMinutes: next.topic.estimatedMinutes,
          exercises: next.topic.exercises,
          miniProject: next.topic.miniProject,
          phaseTitle: next.phase.title,
          phaseIndex: next.phaseIndex,
          topicIndex: next.topicIndex,
        }
      : null,
  };
}
