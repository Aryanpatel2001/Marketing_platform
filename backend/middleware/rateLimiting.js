import rateLimit from 'express-rate-limit';
import { appConfig } from '../config/app.js';

/**
 * Conditional rate limiter wrapper
 * Returns a no-op middleware if rate limiting is disabled
 */
const conditionalRateLimit = (config) => {
  if (!appConfig.rateLimit.enabled) {
    // Return a no-op middleware that just calls next()
    return (req, res, next) => next();
  }
  return rateLimit(config);
};

/**
 * General API rate limiting
 */
export const generalLimiter = conditionalRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: true,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      error: true,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

/**
 * Strict rate limiting for authentication endpoints
 */
export const authLimiter = conditionalRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: true,
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    res.status(429).json({
      error: true,
      message: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

/**
 * Rate limiting for chat endpoints
 */
export const chatLimiter = conditionalRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 chat messages per minute
  message: {
    error: true,
    message: 'Too many chat messages, please slow down.',
    retryAfter: '1 minute'
  },
  handler: (req, res) => {
    res.status(429).json({
      error: true,
      message: 'Too many chat messages, please slow down.',
      retryAfter: '1 minute'
    });
  }
});

/**
 * Rate limiting for voice call endpoints
 */
export const voiceLimiter = conditionalRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limit each IP to 10 voice calls per 5 minutes
  message: {
    error: true,
    message: 'Too many voice call attempts, please wait before trying again.',
    retryAfter: '5 minutes'
  },
  handler: (req, res) => {
    res.status(429).json({
      error: true,
      message: 'Too many voice call attempts, please wait before trying again.',
      retryAfter: '5 minutes'
    });
  }
});

/**
 * Rate limiting for agent creation/modification
 */
export const agentLimiter = conditionalRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 agent operations per hour
  message: {
    error: true,
    message: 'Too many agent operations, please try again later.',
    retryAfter: '1 hour'
  },
  handler: (req, res) => {
    res.status(429).json({
      error: true,
      message: 'Too many agent operations, please try again later.',
      retryAfter: '1 hour'
    });
  }
});

/**
 * Rate limiting for function execution
 */
export const functionLimiter = conditionalRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 function executions per minute
  message: {
    error: true,
    message: 'Too many function executions, please slow down.',
    retryAfter: '1 minute'
  },
  handler: (req, res) => {
    res.status(429).json({
      error: true,
      message: 'Too many function executions, please slow down.',
      retryAfter: '1 minute'
    });
  }
});

/**
 * Rate limiting for file uploads (future use)
 */
export const uploadLimiter = conditionalRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 uploads per 15 minutes
  message: {
    error: true,
    message: 'Too many upload attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  handler: (req, res) => {
    res.status(429).json({
      error: true,
      message: 'Too many upload attempts, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

/**
 * Create custom rate limiter
 */
export const createCustomLimiter = (windowMs, max, message) => {
  return conditionalRateLimit({
    windowMs,
    max,
    message: {
      error: true,
      message,
      retryAfter: `${Math.ceil(windowMs / 60000)} minutes`
    },
    handler: (req, res) => {
      res.status(429).json({
        error: true,
        message,
        retryAfter: `${Math.ceil(windowMs / 60000)} minutes`
      });
    }
  });
};