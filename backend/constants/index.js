/**
 * Application Constants
 * Centralized constants for the application
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'Unauthorized access',
  TOKEN_REQUIRED: 'Access token required',
  TOKEN_INVALID: 'Invalid or expired token',
  TOKEN_EXPIRED: 'Token has expired',
  
  // User
  USER_NOT_FOUND: 'User not found',
  EMAIL_EXISTS: 'Email already registered',
  EMAIL_IN_USE: 'Email already in use',
  
  // Validation
  VALIDATION_FAILED: 'Validation failed',
  INVALID_INPUT: 'Invalid input data',
  
  // Server
  INTERNAL_ERROR: 'Internal server error',
  DATABASE_ERROR: 'Database operation failed',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  
  // Rate Limiting
  TOO_MANY_REQUESTS: 'Too many requests, please try again later',
  TOO_MANY_AUTH_ATTEMPTS: 'Too many authentication attempts, please try again later',
  
  // Not Found
  ROUTE_NOT_FOUND: 'Route not found',
  RESOURCE_NOT_FOUND: 'Resource not found',
};

export const SUCCESS_MESSAGES = {
  // User
  USER_REGISTERED: 'User registered successfully',
  USER_LOGGED_IN: 'Login successful',
  USER_LOGGED_OUT: 'Logged out successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  
  // General
  OPERATION_SUCCESS: 'Operation completed successfully',
  DATABASE_INITIALIZED: 'Database initialized successfully',
};

export const VALIDATION_RULES = {
  // Password
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  
  // Name
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  NAME_PATTERN: /^[a-zA-Z\s]+$/,
  
  // Email
  EMAIL_MAX_LENGTH: 255,
  
  // General
  UUID_PATTERN: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
};

export const RATE_LIMITS = {
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  },
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    skipSuccessfulRequests: true,
  },
  CHAT: {
    windowMs: 60 * 1000, // 1 minute
    max: 30,
  },
  VOICE: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
  },
  AGENT: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
  },
  FUNCTION: {
    windowMs: 60 * 1000, // 1 minute
    max: 60,
  },
  UPLOAD: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
  },
};

export default {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES,
  RATE_LIMITS,
};

