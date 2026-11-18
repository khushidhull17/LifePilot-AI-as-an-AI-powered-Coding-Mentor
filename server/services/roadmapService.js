import { Roadmap } from '../models/Roadmap.js';
import { generateJson } from './geminiService.js';
import { roadmapPrompt } from './prompts.js';
import { roadmapPlanSchema } from '../utils/schemas.js';
import { computeRoadmapStats, flattenTopics } from '../utils/roadmap.js';
import { ApiError } from '../utils/ApiError.js';
import { recordMilestone, recordTopicCompletion, removeTopicCompletion } from './progressService.js';

export const getActiveRoadmap = (userId) =>
  Roadmap.findOne({ userId, isActive: true }).sort({ createdAt: -1 });

/**
 * Ask Gemini for a structured roadmap and store it only after validation.
 * Existing roadmaps are archived (not deleted) so history is preserved.
 */
export async function generateRoadmap(user, overrides = {}) {
  const plan = await generateJson({
    systemInstruction:
      'You are a curriculum designer for beginner programmers. You create realistic, progressive roadmaps and always return valid JSON.',
    prompt: roadmapPrompt(user, overrides),
    schema: roadmapPlanSchema,
    temperature: 0.5,
    maxOutputTokens: 8000,
  });

  const roadmap = await saveRoadmapPlan(user, plan);
  return roadmap;
}

export async function saveRoadmapPlan(user, plan) {
  const validated = roadmapPlanSchema.parse(plan);

  const roadmap = await Roadmap.create({
    userId: user._id,
    title: validated.title,
    description: validated.description,
    learningGoal: user.learningGoal || '',
    language: user.preferredLanguage || '',
    skillLevel: user.skillLevel || '',
    phases: validated.phases,
    isActive: true,
  });

  // Archive older roadmaps only after the new one saved successfully.
  await Roadmap.updateMany(
    { userId: user._id, isActive: true, _id: { $ne: roadmap._id } },
    { $set: { isActive: false } }
  );

  await recordMilestone(user._id, {
    type: 'roadmap_generated',
    title: 'New AI roadmap generated',
    description: `${roadmap.title} • ${roadmap.phases.length} phases`,
  });

  return roadmap;
}

export async function getRoadmapView(user) {
  const roadmap = await getActiveRoadmap(user._id);
  return {
    roadmap,
    stats: computeRoadmapStats(roadmap),
  };
}

/**
 * Toggle a topic and keep the Progress collection in sync.
 * The roadmap is scoped by userId, so one user can never touch another's data.
 */
export async function setTopicCompletion(user, topicId, completed) {
  const roadmap = await getActiveRoadmap(user._id);
  if (!roadmap) {
    throw new ApiError(404, 'Generate a roadmap before updating topics.', 'NO_ROADMAP');
  }

  const entry = flattenTopics(roadmap).find(({ topic }) => topic._id.toString() === topicId.toString());
  if (!entry) {
    throw new ApiError(404, 'Topic not found in your active roadmap.', 'TOPIC_NOT_FOUND');
  }

  const { topic, phase } = entry;
  const wasCompleted = topic.completed;

  if (completed !== wasCompleted) {
    topic.completed = completed;
    topic.completedAt = completed ? new Date() : null;
    await roadmap.save();

    if (completed) {
      await recordTopicCompletion(user._id, roadmap, phase, topic);
    } else {
      await removeTopicCompletion(user._id, roadmap, topic);
    }
  }

  const stats = computeRoadmapStats(roadmap);

  // The roadmap stays active at 100% so the learner can revisit it; the client
  // shows a celebration state instead of auto-archiving it.
  return { roadmap, stats, topic: { ...topic.toObject(), completed } };
}

export async function findTopic(roadmap, topicId) {
  const entry = flattenTopics(roadmap).find(({ topic }) => topic._id.toString() === topicId.toString());
  return entry || null;
}
