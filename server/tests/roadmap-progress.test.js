import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {
  authHeader,
  createRoadmapFixture,
  registerUser,
  resetDatabase,
  startTestApp,
  stopTestApp,
} from './support.js';

let app;
let mongo;

before(async () => {
  const started = await startTestApp();
  app = started.app;
  mongo = started.mongo;
});

after(async () => {
  await stopTestApp(mongo);
});

beforeEach(async () => {
  await resetDatabase();
});

test('roadmap view returns real statistics and topic completion updates progress', async () => {
  const { token, user } = await registerUser(app, { email: 'roadmap@example.com' });
  const roadmap = await createRoadmapFixture(user._id);
  const topicId = roadmap.phases[0].topics[0]._id.toString();

  const view = await request(app).get('/api/roadmap').set(authHeader(token));
  assert.equal(view.status, 200);
  assert.equal(view.body.roadmap._id, roadmap._id.toString());
  assert.equal(view.body.stats.totalTopics, 3);
  assert.equal(view.body.stats.completedTopics, 0);
  assert.equal(view.body.stats.completionPercent, 0);
  assert.equal(view.body.stats.nextTopic.title, 'HTML semantics');

  const complete = await request(app)
    .patch(`/api/roadmap/topics/${topicId}`)
    .set(authHeader(token))
    .send({ completed: true });

  assert.equal(complete.status, 200);
  assert.equal(complete.body.stats.completedTopics, 1);
  assert.equal(complete.body.stats.completionPercent, 33);
  assert.ok(complete.body.topic.completedAt);

  const summary = await request(app).get('/api/progress/summary').set(authHeader(token));
  assert.equal(summary.status, 200);
  assert.equal(summary.body.roadmap.completedTopics, 1);
  assert.equal(summary.body.roadmap.pendingTopics, 2);
  assert.equal(summary.body.streak.current, 1);
  assert.equal(summary.body.dailyGoal.completedMinutes, 30);
  assert.equal(summary.body.recentActivities[0].type, 'topic_completed');

  // Completing the same topic again should not duplicate progress entries.
  const duplicate = await request(app)
    .patch(`/api/roadmap/topics/${topicId}`)
    .set(authHeader(token))
    .send({ completed: true });
  assert.equal(duplicate.status, 200);
  assert.equal(duplicate.body.stats.completedTopics, 1);

  const reopen = await request(app)
    .patch(`/api/roadmap/topics/${topicId}`)
    .set(authHeader(token))
    .send({ completed: false });
  assert.equal(reopen.status, 200);
  assert.equal(reopen.body.stats.completedTopics, 0);
  assert.equal(reopen.body.topic.completed, false);

  const afterReopen = await request(app).get('/api/progress/summary').set(authHeader(token));
  assert.equal(afterReopen.body.roadmap.completedTopics, 0);
});

test('one user cannot modify another user\'s roadmap topic', async () => {
  const owner = await registerUser(app, { email: 'owner@example.com' });
  const attacker = await registerUser(app, { email: 'attacker@example.com' });
  const roadmap = await createRoadmapFixture(owner.user._id);
  const topicId = roadmap.phases[0].topics[0]._id.toString();

  const response = await request(app)
    .patch(`/api/roadmap/topics/${topicId}`)
    .set(authHeader(attacker.token))
    .send({ completed: true });

  assert.equal(response.status, 404);
  assert.equal(response.body.code, 'NO_ROADMAP');
});

test('topic id from another roadmap is not accepted', async () => {
  const owner = await registerUser(app, { email: 'roadmap-owner@example.com' });
  const other = await registerUser(app, { email: 'roadmap-other@example.com' });
  const roadmap = await createRoadmapFixture(owner.user._id);
  await createRoadmapFixture(other.user._id);

  const topicId = roadmap.phases[0].topics[0]._id.toString();
  const response = await request(app)
    .patch(`/api/roadmap/topics/${topicId}`)
    .set(authHeader(other.token))
    .send({ completed: true });

  assert.equal(response.status, 404);
  assert.equal(response.body.code, 'TOPIC_NOT_FOUND');
});

test('practice challenges hide solutions until completed and score once', async () => {
  const { token } = await registerUser(app, { email: 'practice@example.com' });

  const list = await request(app).get('/api/practice').set(authHeader(token));
  assert.equal(list.status, 200);
  assert.ok(list.body.challenges.length >= 10);
  assert.ok(list.body.meta.total >= 10);
  assert.equal(list.body.challenges[0].solution, undefined);

  const challenge = list.body.challenges[0];

  const before = await request(app).get(`/api/practice/${challenge.id}`).set(authHeader(token));
  assert.equal(before.status, 200);
  assert.equal(before.body.challenge.solution, undefined);
  assert.equal(before.body.challenge.explanation, undefined);

  const complete = await request(app)
    .post(`/api/practice/${challenge.id}/complete`)
    .set(authHeader(token));

  assert.equal(complete.status, 200);
  assert.equal(complete.body.completed, true);
  assert.equal(complete.body.awarded, challenge.points);
  assert.ok(complete.body.solution);
  assert.ok(complete.body.explanation);

  const after = await request(app).get(`/api/practice/${challenge.id}`).set(authHeader(token));
  assert.equal(after.body.challenge.completed, true);
  assert.ok(after.body.challenge.solution);

  const duplicate = await request(app)
    .post(`/api/practice/${challenge.id}/complete`)
    .set(authHeader(token));
  assert.equal(duplicate.status, 200);
  assert.equal(duplicate.body.alreadyDone, true);
  assert.equal(duplicate.body.awarded, 0);
  assert.equal(duplicate.body.totalScore, challenge.points);

  const summary = await request(app).get('/api/progress/summary').set(authHeader(token));
  assert.equal(summary.body.challenges.completed, 1);
  assert.equal(summary.body.challenges.score, challenge.points);
});

test('agent confirmation applies a pending topic update and blocks other users', async () => {
  const { token, user } = await registerUser(app, { email: 'agent@example.com' });
  const attacker = await registerUser(app, { email: 'agent-attacker@example.com' });
  const roadmap = await createRoadmapFixture(user._id);
  const topicId = roadmap.phases[0].topics[0]._id.toString();

  const { AgentRun } = await import('../models/AgentRun.js');
  const run = await AgentRun.create({
    userId: user._id,
    input: 'Mark HTML semantics complete',
    output: 'I can do that once you approve.',
    status: 'awaiting_confirmation',
    pendingActions: [
      {
        name: 'updateTopicStatus',
        args: { topicId, completed: true },
        summary: 'Mark complete: HTML semantics',
      },
    ],
  });
  const actionId = run.pendingActions[0]._id.toString();

  const blocked = await request(app)
    .post(`/api/agent/runs/${run._id}/confirm`)
    .set(authHeader(attacker.token))
    .send({ actionId });
  assert.equal(blocked.status, 404);

  const confirmed = await request(app)
    .post(`/api/agent/runs/${run._id}/confirm`)
    .set(authHeader(token))
    .send({ actionId });

  assert.equal(confirmed.status, 200);
  assert.equal(confirmed.body.result.completionPercent, 33);
  assert.equal(confirmed.body.run.pendingActions[0].status, 'applied');

  const summary = await request(app).get('/api/progress/summary').set(authHeader(token));
  assert.equal(summary.body.roadmap.completedTopics, 1);

  const repeat = await request(app)
    .post(`/api/agent/runs/${run._id}/confirm`)
    .set(authHeader(token))
    .send({ actionId });
  assert.equal(repeat.status, 409);
  assert.equal(repeat.body.code, 'ACTION_ALREADY_HANDLED');
});

test('agent confirmation can save a proposed roadmap after approval', async () => {
  const { token, user } = await registerUser(app, { email: 'agent-roadmap@example.com' });
  const oldRoadmap = await createRoadmapFixture(user._id);

  const newPlan = {
    title: 'Python Starter Path',
    description: 'A calm introduction to Python for an absolute beginner who wants small wins.',
    phases: [
      {
        title: 'Phase 1: Python basics',
        description: 'Learn variables, input and simple functions.',
        estimatedHours: 6,
        topics: [
          {
            title: 'Variables and printing',
            explanation: 'Variables store values, and print shows them in the terminal.',
            estimatedMinutes: 30,
            exercises: ['Print a greeting'],
            miniProject: 'Write a tip calculator',
          },
        ],
      },
    ],
  };

  const { AgentRun } = await import('../models/AgentRun.js');
  const run = await AgentRun.create({
    userId: user._id,
    input: 'Give me a Python roadmap',
    output: 'Here is a proposal. Approve it to save.',
    status: 'awaiting_confirmation',
    pendingActions: [
      {
        name: 'saveRoadmap',
        args: newPlan,
        summary: 'Replace roadmap with Python Starter Path',
      },
    ],
  });
  const actionId = run.pendingActions[0]._id.toString();

  const confirmed = await request(app)
    .post(`/api/agent/runs/${run._id}/confirm`)
    .set(authHeader(token))
    .send({ actionId });

  assert.equal(confirmed.status, 200);
  assert.equal(confirmed.body.result.phases, 1);

  const view = await request(app).get('/api/roadmap').set(authHeader(token));
  assert.equal(view.body.roadmap.title, 'Python Starter Path');

  const { Roadmap } = await import('../models/Roadmap.js');
  const old = await Roadmap.findById(oldRoadmap._id);
  assert.equal(old.isActive, false);
});

test('agent dismiss leaves data unchanged', async () => {
  const { token, user } = await registerUser(app, { email: 'dismiss@example.com' });
  const roadmap = await createRoadmapFixture(user._id);
  const topicId = roadmap.phases[0].topics[0]._id.toString();

  const { AgentRun } = await import('../models/AgentRun.js');
  const run = await AgentRun.create({
    userId: user._id,
    input: 'Complete the topic',
    output: 'Approve to apply.',
    status: 'awaiting_confirmation',
    pendingActions: [
      {
        name: 'updateTopicStatus',
        args: { topicId, completed: true },
        summary: 'Mark complete: HTML semantics',
      },
    ],
  });

  const dismissed = await request(app)
    .post(`/api/agent/runs/${run._id}/dismiss`)
    .set(authHeader(token))
    .send({ actionId: run.pendingActions[0]._id.toString() });

  assert.equal(dismissed.status, 200);
  assert.equal(dismissed.body.run.pendingActions[0].status, 'dismissed');

  const summary = await request(app).get('/api/progress/summary').set(authHeader(token));
  assert.equal(summary.body.roadmap.completedTopics, 0);
});
