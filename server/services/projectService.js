import { ProjectRecommendation } from '../models/ProjectRecommendation.js';
import { generateJson } from './geminiService.js';
import { projectsPrompt } from './prompts.js';
import { projectListSchema } from '../utils/schemas.js';
import { getActiveRoadmap } from './roadmapService.js';
import { flattenTopics } from '../utils/roadmap.js';
import { recordMilestone } from './progressService.js';

export async function getLatestRecommendations(userId) {
  const latest = await ProjectRecommendation.findOne({ userId }).sort({ createdAt: -1 });
  return latest;
}

export async function generateProjectRecommendations(user, count = 3) {
  const roadmap = await getActiveRoadmap(user._id);
  const completedTopics = flattenTopics(roadmap)
    .filter(({ topic }) => topic.completed)
    .map(({ topic }) => topic.title);

  const result = await generateJson({
    systemInstruction:
      'You are a senior developer who mentors beginners. You recommend realistic portfolio projects and always return valid JSON.',
    prompt: projectsPrompt(user, completedTopics, count),
    schema: projectListSchema,
    temperature: 0.65,
    maxOutputTokens: 5000,
  });

  const recommendation = await ProjectRecommendation.create({
    userId: user._id,
    context: {
      language: user.preferredLanguage,
      skillLevel: user.skillLevel,
      completedTopics,
    },
    projects: result.projects.slice(0, count),
  });

  await recordMilestone(user._id, {
    type: 'projects_generated',
    title: 'New project ideas recommended',
    description: result.projects.map((project) => project.title).join(' • '),
  });

  return recommendation;
}
