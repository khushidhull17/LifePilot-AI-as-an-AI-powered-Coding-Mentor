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

test('register creates a user and returns a JWT without the password', async () => {
  const { response, payload } = await registerUser(app);

  assert.equal(response.status, 201);
  assert.ok(response.body.token);
  assert.equal(response.body.user.email, payload.email.toLowerCase());
  assert.equal(response.body.user.password, undefined);
  assert.equal(response.body.user.onboardingCompleted, false);
});

test('register rejects weak input and duplicate emails', async () => {
  const first = await registerUser(app, { email: 'duplicate@example.com' });
  assert.equal(first.response.status, 201);

  const duplicate = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Another Learner', email: 'duplicate@example.com', password: 'password123' });

  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.body.code, 'EMAIL_IN_USE');

  const weak = await request(app)
    .post('/api/auth/register')
    .send({ name: 'A', email: 'bad-email', password: 'short' });

  assert.equal(weak.status, 422);
  assert.equal(weak.body.code, 'VALIDATION_ERROR');
});

test('login works and rejects incorrect credentials', async () => {
  const { payload } = await registerUser(app, { email: 'login@example.com' });

  const wrong = await request(app)
    .post('/api/auth/login')
    .send({ email: payload.email, password: 'wrong-password' });
  assert.equal(wrong.status, 401);
  assert.equal(wrong.body.code, 'INVALID_CREDENTIALS');

  const success = await request(app)
    .post('/api/auth/login')
    .send({ email: payload.email, password: payload.password });
  assert.equal(success.status, 200);
  assert.ok(success.body.token);
  assert.equal(success.body.user.email, payload.email);
});

test('profile routes are protected and profile updates are saved', async () => {
  const unauthorized = await request(app).get('/api/users/me');
  assert.equal(unauthorized.status, 401);

  const { token, user } = await registerUser(app, { email: 'profile@example.com' });

  const update = await request(app)
    .patch('/api/users/me')
    .set(authHeader(token))
    .send({
      skillLevel: 'beginner',
      preferredLanguage: 'Python',
      dailyStudyTime: 90,
      learningGoal: 'Build a small automation project',
      onboardingCompleted: true,
    });

  assert.equal(update.status, 200);
  assert.equal(update.body.user.skillLevel, 'beginner');
  assert.equal(update.body.user.preferredLanguage, 'Python');
  assert.equal(update.body.user.dailyStudyTime, 90);
  assert.equal(update.body.user.onboardingCompleted, true);
  assert.equal(update.body.user._id, user._id);

  const me = await request(app).get('/api/auth/me').set(authHeader(token));
  assert.equal(me.status, 200);
  assert.equal(me.body.user.learningGoal, 'Build a small automation project');
});

test('profile validation rejects unknown fields and invalid values', async () => {
  const { token } = await registerUser(app, { email: 'validation@example.com' });

  const invalid = await request(app)
    .patch('/api/users/me')
    .set(authHeader(token))
    .send({ dailyStudyTime: 5, skillLevel: 'expert', hacker: true });

  assert.equal(invalid.status, 422);
  assert.equal(invalid.body.code, 'VALIDATION_ERROR');
});

test('password change requires the current password', async () => {
  const { token, payload } = await registerUser(app, { email: 'password@example.com' });

  const wrong = await request(app)
    .patch('/api/users/me/password')
    .set(authHeader(token))
    .send({ currentPassword: 'not-my-password', newPassword: 'newpassword123' });
  assert.equal(wrong.status, 401);
  assert.equal(wrong.body.code, 'INVALID_PASSWORD');

  const success = await request(app)
    .patch('/api/users/me/password')
    .set(authHeader(token))
    .send({ currentPassword: payload.password, newPassword: 'newpassword123' });
  assert.equal(success.status, 200);

  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: payload.email, password: 'newpassword123' });
  assert.equal(login.status, 200);
});

test('health endpoint reports database connectivity without leaking secrets', async () => {
  const response = await request(app).get('/api/health');

  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'ok');
  assert.equal(response.body.database, 'connected');
  assert.equal(response.body.aiConfigured, false);
  assert.equal(response.body.geminiApiKey, undefined);
});
