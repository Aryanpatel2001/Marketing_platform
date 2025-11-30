/**
 * Authentication Service
 * Business logic for authentication operations
 */

import { 
  createUser as createUserRepo, 
  findUserByEmail, 
  emailExists as emailExistsRepo,
  verifyPassword as verifyPasswordRepo,
  updateLastLogin,
  updateUser as updateUserRepo,
  getUserStats,
  findUserById
} from '../db/repositories/userRepository.js';
import { generateToken } from '../utils/auth.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../errors/AppError.js';
import { ERROR_MESSAGES } from '../constants/index.js';
import logger from '../utils/logger.js';

/**
 * Register a new user
 */
export async function registerUser(userData) {
  const { email, password, name } = userData;

  // Check if email already exists
  if (await emailExistsRepo(email)) {
    throw new ConflictError(ERROR_MESSAGES.EMAIL_EXISTS);
  }

  // Create user
  const user = await createUserRepo({ email, password, name });

  // Generate token
  const token = generateToken(user);

  logger.info('User registered successfully', { userId: user.id, email: user.email });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      isVerified: user.is_verified,
      createdAt: user.created_at,
    },
    token,
  };
}

/**
 * Login user
 */
export async function loginUser(email, password) {
  // Find user
  const user = await findUserByEmail(email);
  if (!user) {
    throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  // Verify password
  const isValidPassword = await verifyPasswordRepo(password, user.password);
  if (!isValidPassword) {
    throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  // Update last login
  const updatedUser = await updateLastLogin(user.id);

  // Generate token
  const token = generateToken(updatedUser);

  logger.info('User logged in successfully', { userId: updatedUser.id, email: updatedUser.email });

  return {
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      isVerified: updatedUser.is_verified,
      lastLogin: updatedUser.last_login,
      createdAt: updatedUser.created_at,
    },
    token,
  };
}

/**
 * Get user profile
 */
export async function getUserProfile(userId) {
  const user = await findUserById(userId);
  if (!user) {
    throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  const stats = await getUserStats(userId);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      isVerified: user.is_verified,
      lastLogin: user.last_login,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    },
    stats,
  };
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId, updates, currentEmail) {
  const { name, email } = updates;

  // Check if new email already exists (if email is being changed)
  if (email && email !== currentEmail) {
    if (await emailExistsRepo(email)) {
      throw new ConflictError(ERROR_MESSAGES.EMAIL_IN_USE);
    }
  }

  const updatedUser = await updateUserRepo(userId, { name, email });

  logger.info('User profile updated', { userId: updatedUser.id });

  return {
    id: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.name,
    isVerified: updatedUser.is_verified,
    lastLogin: updatedUser.last_login,
    createdAt: updatedUser.created_at,
    updatedAt: updatedUser.updated_at,
  };
}

export default {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};

