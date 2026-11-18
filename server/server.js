import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env, isAiConfigured } from './config/env.js';

async function start() {
  await connectDB(env.mongoUri);

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`LifePilot API running on http://localhost:${env.port}`);
    if (!isAiConfigured()) {
      console.warn(
        'AI features are disabled: add GEMINI_API_KEY to server/.env to enable roadmap generation, mentor chat, debugging and project ideas.'
      );
    }
  });

  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Closing server...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
  });
}

start().catch((error) => {
  console.error('Failed to start LifePilot API:', error.message);
  process.exit(1);
});
