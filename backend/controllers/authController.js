import * as authService from '../services/authService.js';
import { getUserStats, updateUser, emailExists } from '../db/repositories/userRepository.js';

/**
 * Handle user registration
 */
export const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        isVerified: result.user.is_verified,
        createdAt: result.user.created_at
      },
      token: result.token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user login
 */
export const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        isVerified: result.user.is_verified,
        lastLogin: result.user.last_login,
        createdAt: result.user.created_at
      },
      token: result.token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const stats = await getUserStats(user.id);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isVerified: user.is_verified,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      },
      stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    // Check if new email already exists (if email is being changed)
    if (email && email !== req.user.email) {
      if (await emailExists(email)) {
        const error = new Error('Email already in use');
        error.status = 400;
        throw error;
      }
    }

    const updatedUser = await updateUser(userId, { name, email });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        isVerified: updatedUser.is_verified,
        lastLogin: updatedUser.last_login,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 */
export const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * Verify token
 */
export const verify = (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      isVerified: req.user.is_verified
    }
  });
};

