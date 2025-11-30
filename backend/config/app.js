/**
 * Application Configuration
 * Centralized configuration for the application
 */

import { env } from './env.js';

export const appConfig = {
  // Server
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  
  // API
  apiPrefix: '/api',
  
  // Security
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  
  // CORS
  cors: {
    origin: env.FRONTEND_URL || env.PRODUCTION_DOMAIN || [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:4173',
    ],
    credentials: true,
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  },
  
  // Request Limits
  requestSizeLimit: '10mb',
  
  // Database
  database: {
    enabled: env.ENABLE_DATABASE,
    url: env.DATABASE_URL,
  },
};

export default appConfig;

