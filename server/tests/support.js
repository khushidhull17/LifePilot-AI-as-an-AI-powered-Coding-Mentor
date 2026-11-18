import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-secret-that-is-long-enough';
process.env.AI_RATE_LIMIT = '100';
process.env.GEMINI_API_KEY = '';

export async function startTestApp() {
  const mongo = await MongoMemoryServer.create();
  const { connectDB } = await import('../config/db.js');
  await connectDB(mongo.getUri());

  const { createApp } = await import('../app.js');
  return { app: createApp(), mongo };
}

export async function resetDatabase() {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

export async function stopTestApp(mongo) {
  await mongoose.disconnect();
  await mongo.stop();
}

export async function registerUser(app, overrides = {}) {
  const payload = {
    name: 'Test Learner',
    email: `learner-${Date.now()}-${Math.round(Math.random() * 100000)}@example.com`,
    password: 'password123',
    ...overrides,
  };

  const response = await request(app).post('/api/auth/register').send(payload);
  return { response, payload, token: response.body.token, user: response.body.user };
}

export const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

export async function createRoadmapFixture(userId) {
  const { Roadmap } = await import('../models/Roadmap.js');
  return Roadmap.create({
    userId,
    title: 'Full Stack Foundations',
    description: 'A test roadmap that covers the basics from HTML to a small full-stack project.',
    learningGoal: 'Build my first project',
    language: 'HTML, CSS & JavaScript',
    skillLevel: 'absolute-beginner',
    phases: [
      {
        title: 'Phase 1: Web foundations',
        description: 'Learn how the web is structured and styled.',
        estimatedHours: 6,
        topics: [
          {
            title: 'HTML semantics',
            explanation: 'Semantic HTML gives your content meaning and helps accessibility tools.',
            estimatedMinutes: 30,
            exercises: ['Build a semantic about section'],
            miniProject: 'Create a personal profile page',
          },
          {
            title: 'CSS Flexbox',
            explanation: 'Flexbox is a layout model for arranging items in rows and columns.',
            estimatedMinutes: 40,
            exercises: ['Center a profile card'],
            miniProject: 'Build a pricing card row',
          },
        ],
      },
      {
        title: 'Phase 2: JavaScript',
        description: 'Add behaviour and interactivity to your pages.',
        estimatedHours: 8,
        topics: [
          {
            title: 'Variables and functions',
            explanation: 'Variables store values and functions group reusable behaviour.',
            estimatedMinutes: 35,
            exercises: ['Write a greeting function'],
            miniProject: 'Build a tip calculator',
          },
        ],
      },
    ],
  });
}
