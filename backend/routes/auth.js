import express from 'express';
import * as authController from '../controllers/authController.js';
import { validateRegister, validateLogin, validateProfileUpdate } from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimiting.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', authLimiter, validateRegister, authController.register);

router.post('/login', authLimiter, validateLogin, authController.login);

router.get('/profile', authenticateToken, authController.getProfile);

router.put('/profile', authenticateToken, validateProfileUpdate, authController.updateProfile);

router.post('/logout', authenticateToken, authController.logout);

router.get('/verify', authenticateToken, authController.verify);

export default router;
