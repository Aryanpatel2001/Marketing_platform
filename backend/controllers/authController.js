/**
 * Authentication Controller
 * Handles HTTP requests for authentication routes
 */

import * as authService from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, HTTP_STATUS } from '../constants/index.js';
import logger from '../utils/logger.js';

/**
 * Register new user
 */
export async function register(req, res, next) {
  try {
    const result = await authService.registerUser(req.body);
    
    return sendSuccess(
      res,
      result,
      SUCCESS_MESSAGES.USER_REGISTERED,
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    logger.error('Register error', error);
    next(error);
  }
}

/**
 * Login user
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    
    return sendSuccess(
      res,
      result,
      SUCCESS_MESSAGES.USER_LOGGED_IN
    );
  } catch (error) {
    logger.error('Login error', error);
    next(error);
  }
}

/**
 * Get current user profile
 */
export async function getProfile(req, res, next) {
  try {
    const result = await authService.getUserProfile(req.user.id);
    
    return sendSuccess(res, result);
  } catch (error) {
    logger.error('Get profile error', error);
    next(error);
  }
}

/**
 * Update user profile
 */
export async function updateProfile(req, res, next) {
  try {
    const result = await authService.updateUserProfile(
      req.user.id,
      req.body,
      req.user.email
    );
    
    return sendSuccess(
      res,
      { user: result },
      SUCCESS_MESSAGES.PROFILE_UPDATED
    );
  } catch (error) {
    logger.error('Update profile error', error);
    next(error);
  }
}

/**
 * Logout user
 */
export async function logout(req, res) {
  // In a more sophisticated setup, you might want to blacklist the token
  // For now, we just return success and let the client remove the token
  return sendSuccess(res, null, SUCCESS_MESSAGES.USER_LOGGED_OUT);
}

/**
 * Verify token
 */
export async function verifyToken(req, res) {
  return sendSuccess(res, {
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      isVerified: req.user.is_verified,
    },
  });
}

export default {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
  verifyToken,
};

