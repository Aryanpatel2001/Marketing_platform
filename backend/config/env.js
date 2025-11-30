/**
 * Environment Configuration
 * Validates and exports environment variables
 */

import dotenv from 'dotenv';

dotenv.config();

/**
 * Validate required environment variables
 */
function validateEnv() {
  const required = ['JWT_SECRET'];
  const missing = [];

  required.forEach(key => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('   Please check your .env file');
    process.exit(1);
  }
}

// Validate on import
validateEnv();

export const env = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL,
  PRODUCTION_DOMAIN: process.env.PRODUCTION_DOMAIN,
  
  // API Keys
  API_KEYS: process.env.API_KEYS ? process.env.API_KEYS.split(',') : [],
  
  // Feature Flags
  ENABLE_DATABASE: !!process.env.DATABASE_URL,
};

export default env;

