import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import apiRoutes from './routes/index.js';
import { env, isAiConfigured } from './config/env.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { ApiError } from './utils/ApiError.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const allowedOrigins = new Set(
  [
    env.clientUrl,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    ...(env.clientUrl ? env.clientUrl.split(',').map((item) => item.trim()) : []),
  ].filter(Boolean)
);

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }
        callback(new ApiError(403, 'This origin is not allowed to call the API.', 'CORS_BLOCKED'));
      },
    })
  );

  app.use(express.json({ limit: '1mb' }));

  if (env.nodeEnv !== 'test') {
    app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
  }

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'LifePilot AI API',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      aiConfigured: isAiConfigured(),
      model: env.geminiModel,
      time: new Date().toISOString(),
    });
  });

  app.use('/api', apiLimiter, apiRoutes);
  app.use('/api', notFound);

  // In production the built React app can be served by Express.
  const clientDist = path.resolve(__dirname, '../client/dist');
  const indexPath = path.join(clientDist, 'index.html');

  if (fs.existsSync(indexPath)) {
    app.use(express.static(clientDist));
    app.get(/^(?!\/api).*/, (req, res) => res.sendFile(indexPath));
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
