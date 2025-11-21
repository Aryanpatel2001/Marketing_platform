import jwt from 'jsonwebtoken';
import { findUserById } from '../db/repositories/userRepository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

/**
 * Authentication middleware
 */
export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: true, 
        message: 'Access token required' 
      });
    }


    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get fresh user data
    const user = await findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        error: true, 
        message: 'User not found' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      error: true, 
      message: 'Invalid or expired token' 
    });
  }
}

/**
 * Optional authentication middleware
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await findUserById(decoded.userId);
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    next();
  }
}

