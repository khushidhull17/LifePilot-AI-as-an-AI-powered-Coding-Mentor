import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {
  authHeader,
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

test('AI endpoints fail gracefully with a setup code when no key is configured', async () => {
  const { token } = await registerUser(app, { email: 'no-ai@example.com' });

  const roadmap = await request(app)
    .post('/api/roadmap/generate')
    .set(authHeader(token))
    .send({});
  assert.equal(roadmap.status, 503);
  assert.equal(roadmap.body.code, 'AI_NOT_CONFIGURED');

  const mentor = await request(app)
    .post('/api/mentor/chat')
    .set(authHeader(token))
    .send({ message: 'Explain variables to me.' });
  assert.equal(mentor.status, 503);
  assert.equal(mentor.body.code, 'AI_NOT_CONFIGURED');

  const debuggerResponse = await request(app)
    .post('/api/debugger/analyze')
    .set(authHeader(token))
    .send({
      code: 'const x = ;',
      language: 'JavaScript',
      errorMessage: 'SyntaxError',
    });
  assert.equal(debuggerResponse.status, 503);
  assert.equal(debuggerResponse.body.code, 'AI_NOT_CONFIGURED');

  const projects = await request(app)
    .post('/api/projects/recommend')
    .set(authHeader(token))
    .send({ count: 3 });
  assert.equal(projects.status, 503);
  assert.equal(projects.body.code, 'AI_NOT_CONFIGURED');

  const agent = await request(app)
    .post('/api/agent/run')
    .set(authHeader(token))
    .send({ message: 'What should I study next?' });
  assert.equal(agent.status, 503);
  assert.equal(agent.body.code, 'AI_NOT_CONFIGURED');
});

test('AI request validation happens before calling the provider', async () => {
  const { token } = await registerUser(app, { email: 'ai-validation@example.com' });

  const longMessage = await request(app)
    .post('/api/mentor/chat')
    .set(authHeader(token))
    .send({ message: 'x'.repeat(4001) });
  assert.equal(longMessage.status, 422);

  const emptyCode = await request(app)
    .post('/api/debugger/analyze')
    .set(authHeader(token))
    .send({ code: '', language: 'JavaScript' });
  assert.equal(emptyCode.status, 422);

  const badAgent = await request(app)
    .post('/api/agent/run')
    .set(authHeader(token))
    .send({ message: '' });
  assert.equal(badAgent.status, 422);

  const badChatId = await request(app)
    .post('/api/mentor/chat')
    .set(authHeader(token))
    .send({ chatId: 'not-an-id', message: 'Hello' });
  assert.equal(badChatId.status, 422);
});

test('mentor list and projects latest return empty state without AI calls', async () => {
  const { token } = await registerUser(app, { email: 'empty-state@example.com' });

  const chats = await request(app).get('/api/mentor/chats').set(authHeader(token));
  assert.equal(chats.status, 200);
  assert.deepEqual(chats.body.chats, []);
  assert.equal(chats.body.aiConfigured, false);

  const projects = await request(app).get('/api/projects/latest').set(authHeader(token));
  assert.equal(projects.status, 200);
  assert.equal(projects.body.recommendation, null);
  assert.equal(projects.body.aiConfigured, false);
});
