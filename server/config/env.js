import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET?.trim() || 'lifepilot-local-development-secret-change-me';

if (isProduction && !process.env.JWT_SECRET?.trim()) {
  throw new Error('JWT_SECRET must be set in production.');
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI?.trim() || 'mongodb://127.0.0.1:27017/lifepilot',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN?.trim() || '7d',
  geminiApiKey: process.env.GEMINI_API_KEY?.trim() || '',
  geminiModel: process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash',
  clientUrl: process.env.CLIENT_URL?.trim() || 'http://localhost:5173',
  aiRateLimit: Number(process.env.AI_RATE_LIMIT || 30),
};

export const isAiConfigured = () => Boolean(env.geminiApiKey);
