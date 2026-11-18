import { Type } from '@google/genai';
import { AgentRun } from '../models/AgentRun.js';
import { env } from '../config/env.js';
import { getGeminiClient } from '../config/gemini.js';
import { ApiError } from '../utils/ApiError.js';
import { agentSystemPrompt } from './prompts.js';
import { calculateProgressSnapshot } from './agentTools.js';
import { getActiveRoadmap, findTopic, saveRoadmapPlan, setTopicCompletion } from './roadmapService.js';
import { generateProjectRecommendations } from './projectService.js';
import { recordMilestone } from './progressService.js';
import { mapGeminiError } from './geminiService.js';
import {
  saveRoadmapArgsSchema,
  updateTopicArgsSchema,
} from '../utils/schemas.js';

const MAX_TOOL_ROUNDS = 4;
const MAX_TOOL_CALLS = 6;

const toolDeclarations = [
  {
    name: 'getUserProgress',
    description: 'Read the learner’s roadmap completion, streak, challenge score and next topic.',
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: 'getNextLearningTask',
    description: 'Read the next incomplete roadmap topic, including its topicId.',
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: 'recommendProjects',
    description: 'Generate project ideas based on the learner’s language, level and completed topics.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        count: {
          type: Type.NUMBER,
          description: 'How many projects to recommend, from 1 to 3.',
        },
      },
    },
  },
  {
    name: 'updateTopicStatus',
    description:
      'Propose marking a roadmap topic complete or incomplete. This requires user confirmation before it is applied.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        topicId: { type: Type.STRING, description: 'A 24-character topic id returned by a read tool.' },
        completed: { type: Type.BOOLEAN, description: 'True to complete the topic, false to reopen it.' },
      },
      required: ['topicId', 'completed'],
    },
  },
  {
    name: 'saveRoadmap',
    description:
      'Propose replacing the active roadmap with a new personalized roadmap. This requires user confirmation.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        phases: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              estimatedHours: { type: Type.NUMBER },
              topics: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    estimatedMinutes: { type: Type.NUMBER },
                    exercises: { type: Type.ARRAY, items: { type: Type.STRING } },
                    miniProject: { type: Type.STRING },
                  },
                  required: ['title', 'explanation', 'estimatedMinutes'],
                },
              },
            },
            required: ['title', 'description', 'topics'],
          },
        },
      },
      required: ['title', 'description', 'phases'],
    },
  },
];

async function executeTool(user, name, args) {
  const traces = [];
  const pendingActions = [];
  let response;

  if (name === 'getUserProgress') {
    const snapshot = await calculateProgressSnapshot(user);
    response = snapshot;
  } else if (name === 'getNextLearningTask') {
    const snapshot = await calculateProgressSnapshot(user);
    response = snapshot.nextTask
      ? { task: snapshot.nextTask }
      : {
          task: null,
          message: 'No active roadmap. Ask the learner to generate one first, or propose saveRoadmap.',
        };
  } else if (name === 'recommendProjects') {
    const count = Math.min(Math.max(Number(args?.count) || 3, 1), 3);
    const recommendation = await generateProjectRecommendations(user, count);
    response = {
      projects: recommendation.projects.map((project) => ({
        title: project.title,
        description: project.description,
        skills: project.skills,
        steps: project.steps.slice(0, 3),
      })),
    };
  } else if (name === 'updateTopicStatus') {
    const parsed = updateTopicArgsSchema.safeParse(args || {});
    if (!parsed.success) {
      return {
        response: { error: 'Invalid arguments. Provide a valid topicId and a boolean completed value.' },
        pendingActions,
        traces,
      };
    }

    const roadmap = await getActiveRoadmap(user._id);
    if (!roadmap) {
      return { response: { error: 'The learner has no active roadmap.' }, pendingActions, traces };
    }

    const entry = findTopic(roadmap, parsed.data.topicId);
    if (!entry) {
      return {
        response: {
          error: 'That topicId does not belong to the active roadmap. Call getUserProgress again.',
        },
        pendingActions,
        traces,
      };
    }

    pendingActions.push({
      name,
      args: parsed.data,
      summary: `${parsed.data.completed ? 'Mark complete' : 'Reopen'}: “${entry.topic.title}”`,
    });
    response = {
      status: 'awaiting_user_confirmation',
      message: `A confirmation request was created to ${parsed.data.completed ? 'complete' : 'reopen'} “${entry.topic.title}”. Tell the learner to approve it below.`,
    };
  } else if (name === 'saveRoadmap') {
    const parsed = saveRoadmapArgsSchema.safeParse(args || {});
    if (!parsed.success) {
      return {
        response: {
          error:
            'Invalid roadmap. Include a title, description, and 1-12 phases. Every phase needs a title, description and 1-12 topics. Every topic needs title, explanation and estimatedMinutes.',
        },
        pendingActions,
        traces,
      };
    }

    const phaseCount = parsed.data.phases.length;
    const topicCount = parsed.data.phases.reduce((sum, phase) => sum + phase.topics.length, 0);
    pendingActions.push({
      name,
      args: parsed.data,
      summary: `Replace roadmap with “${parsed.data.title}” (${phaseCount} phases, ${topicCount} topics)`,
    });
    response = {
      status: 'awaiting_user_confirmation',
      message:
        'The new roadmap was proposed but is NOT saved yet. The learner must approve it in the interface.',
    };
  } else {
    response = { error: `Unknown tool: ${name}` };
  }

  return { response, pendingActions, traces };
}

export async function runAgent(user, message) {
  const ai = getGeminiClient();
  const chat = ai.chats.create({
    model: env.geminiModel,
    config: {
      systemInstruction: agentSystemPrompt(user),
      tools: [{ functionDeclarations: toolDeclarations }],
      temperature: 0.4,
      maxOutputTokens: 3072,
    },
  });

  let response;
  try {
    response = await chat.sendMessage({ message });
  } catch (error) {
    throw mapGeminiError(error);
  }

  const pendingActions = [];
  const trace = [];
  let steps = 0;
  let toolCalls = 0;

  while (response.functionCalls?.length && steps < MAX_TOOL_ROUNDS && toolCalls < MAX_TOOL_CALLS) {
    const parts = [];

    for (const call of response.functionCalls) {
      if (toolCalls >= MAX_TOOL_CALLS) break;
      toolCalls += 1;
      trace.push(call.name || 'unknown_tool');

      const { response: toolResponse, pendingActions: newActions } = await executeTool(
        user,
        call.name,
        call.args
      );
      pendingActions.push(...newActions);

      parts.push({
        functionResponse: {
          name: call.name,
          ...(call.id ? { id: call.id } : {}),
          response: toolResponse,
        },
      });
    }

    if (!parts.length) break;

    try {
      response = await chat.sendMessage({ message: parts });
    } catch (error) {
      throw mapGeminiError(error);
    }
    steps += 1;
  }

  const output =
    response.text?.trim() ||
    'I checked your progress. Choose a small next step below and keep your streak going.';

  const run = await AgentRun.create({
    userId: user._id,
    input: message,
    output,
    steps,
    toolTrace: trace,
    pendingActions,
    status: pendingActions.length ? 'awaiting_confirmation' : 'completed',
  });

  await recordMilestone(user._id, {
    type: 'agent_action',
    title: 'Used the LifePilot planning agent',
    description: message.slice(0, 140),
  });

  return run;
}

export async function getAgentRun(userId, runId) {
  const run = await AgentRun.findOne({ _id: runId, userId });
  if (!run) throw new ApiError(404, 'Agent run not found.', 'AGENT_RUN_NOT_FOUND');
  return run;
}

export async function confirmAgentAction(user, runId, actionId) {
  const run = await getAgentRun(user._id, runId);
  const action = run.pendingActions.id(actionId);

  if (!action) throw new ApiError(404, 'Action not found in this agent run.', 'ACTION_NOT_FOUND');
  if (action.status !== 'pending') {
    throw new ApiError(409, 'This action has already been handled.', 'ACTION_ALREADY_HANDLED');
  }

  try {
    let result;

    if (action.name === 'updateTopicStatus') {
      const args = updateTopicArgsSchema.parse(action.args);
      const { roadmap, stats, topic } = await setTopicCompletion(user, args.topicId, args.completed);
      result = {
        message: args.completed
          ? `Marked “${topic.title}” as complete.`
          : `Reopened “${topic.title}”.`,
        roadmapTitle: roadmap.title,
        completionPercent: stats.completionPercent,
        completedTopics: stats.completedTopics,
        totalTopics: stats.totalTopics,
      };
    } else if (action.name === 'saveRoadmap') {
      const args = saveRoadmapArgsSchema.parse(action.args);
      const roadmap = await saveRoadmapPlan(user, args);
      result = {
        message: `Saved “${roadmap.title}” as your active roadmap.`,
        roadmapId: roadmap._id,
        phases: roadmap.phases.length,
      };
    } else {
      throw new ApiError(400, 'Unsupported agent action.', 'UNSUPPORTED_ACTION');
    }

    action.status = 'applied';
    action.result = result;
    run.status = run.pendingActions.some((item) => item.status === 'pending')
      ? 'awaiting_confirmation'
      : 'completed';
    run.output = `${run.output}\n\n**Applied:** ${result.message}`;
    await run.save();

    return { run, result };
  } catch (error) {
    action.status = 'failed';
    action.result = { error: error.message };
    await run.save();
    throw error;
  }
}

export async function dismissAgentAction(user, runId, actionId) {
  const run = await getAgentRun(user._id, runId);
  const action = run.pendingActions.id(actionId);

  if (!action) throw new ApiError(404, 'Action not found in this agent run.', 'ACTION_NOT_FOUND');
  if (action.status !== 'pending') {
    throw new ApiError(409, 'This action has already been handled.', 'ACTION_ALREADY_HANDLED');
  }

  action.status = 'dismissed';
  action.result = { message: 'Dismissed by the user. No changes were made.' };
  run.status = run.pendingActions.some((item) => item.status === 'pending')
    ? 'awaiting_confirmation'
    : 'completed';
  await run.save();

  return run;
}

export function serializeAgentRun(run) {
  return {
    id: run._id,
    input: run.input,
    output: run.output,
    steps: run.steps,
    toolTrace: run.toolTrace,
    status: run.status,
    pendingActions: run.pendingActions.map((action) => ({
      id: action._id,
      name: action.name,
      summary: action.summary,
      status: action.status,
      result: action.result,
    })),
    createdAt: run.createdAt,
  };
}
