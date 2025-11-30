/**
 * Response Utility
 * Standardized API response helpers
 */

import { HTTP_STATUS } from '../constants/index.js';

/**
 * Send success response
 */
export const sendSuccess = (res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    if (Array.isArray(data)) {
      response.data = data;
    } else if (typeof data === 'object') {
      response.data = data;
    } else {
      response.data = { value: data };
    }
  }

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendError = (res, message = 'Internal server error', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, details = null) => {
  const response = {
    success: false,
    error: true,
    message,
  };

  if (details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send validation error response
 */
export const sendValidationError = (res, details) => {
  return sendError(
    res,
    'Validation failed',
    HTTP_STATUS.BAD_REQUEST,
    details
  );
};

/**
 * Send not found response
 */
export const sendNotFound = (res, message = 'Resource not found') => {
  return sendError(res, message, HTTP_STATUS.NOT_FOUND);
};

/**
 * Send unauthorized response
 */
export const sendUnauthorized = (res, message = 'Unauthorized') => {
  return sendError(res, message, HTTP_STATUS.UNAUTHORIZED);
};

export default {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
  sendUnauthorized,
};

