import { 
  createUser, 
  findUserByEmail, 
  emailExists, 
  updateLastLogin
} from '../db/repositories/userRepository.js';
import { generateToken } from '../utils/auth.js';
import bcrypt from 'bcryptjs';

/**
 * Register a new user
 */
export const registerUser = async ({ email, password, name }) => {
  if (await emailExists(email)) {
    const error = new Error('Email already registered');
    error.status = 400;
    throw error;
  }

  const user = await createUser({ email, password, name });
  
  const token = generateToken(user);

  return { user, token };
};

/**
 * Login user
 */
export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  
  if (!user) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  await updateLastLogin(user.id);
  
  const updatedUser = await updateLastLogin(user.id); 
  
  const token = generateToken(updatedUser);

  return { user: updatedUser, token };
};

