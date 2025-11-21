import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token for user
 */
export function generateToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Extract user ID from request (for authenticated routes)
 */
export function getUserId(req) {
  return req.user?.id;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(req) {
  return !!req.user;
}
