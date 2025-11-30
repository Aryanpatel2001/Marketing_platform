/**
 * Authentication Routes
 * Routes for user authentication and profile management
 */

import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../utils/auth.js';
import { validateRegister, validateLogin, validateProfileUpdate } from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimiting.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', authLimiter, validateRegister, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authLimiter, validateLogin, authController.login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticateToken, validateProfileUpdate, authController.updateProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify token
 * @access  Private
 */
router.get('/verify', authenticateToken, authController.verifyToken);

export default router;
