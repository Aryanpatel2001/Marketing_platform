/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

import { AppError } from '../errors/AppError.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants/index.js';
import { sendError } from '../utils/response.js';
import logger from '../utils/logger.js';
import { appConfig } from '../config/app.js';

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
    // Log error
    logger.error('Error occurred', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
    });

    // Handle known application errors
    if (err instanceof AppError) {
        return sendError(res, err.message, err.statusCode, err.details);
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return sendError(res, ERROR_MESSAGES.TOKEN_INVALID, HTTP_STATUS.UNAUTHORIZED);
    }

    if (err.name === 'TokenExpiredError') {
        return sendError(res, ERROR_MESSAGES.TOKEN_EXPIRED, HTTP_STATUS.UNAUTHORIZED);
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
        return sendError(res, ERROR_MESSAGES.VALIDATION_FAILED, HTTP_STATUS.BAD_REQUEST, err.details);
    }

    // Handle database errors
    if (err.code === '23505') { // PostgreSQL unique violation
        return sendError(res, 'Resource already exists', HTTP_STATUS.CONFLICT);
    }

    if (err.code === '23503') { // PostgreSQL foreign key violation
        return sendError(res, 'Referenced resource does not exist', HTTP_STATUS.BAD_REQUEST);
    }

    // Default error response
    const message = appConfig.isProduction
        ? ERROR_MESSAGES.INTERNAL_ERROR
        : err.message;

    return sendError(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
    return sendError(res, ERROR_MESSAGES.ROUTE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
};

export default {
    errorHandler,
    notFoundHandler,
};

