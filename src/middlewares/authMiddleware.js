import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware: Verify JWT in Authorization Bearer Header
 */
export const verifyToken = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route. Missing authentication token.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'hdfd_secret_fallback_key'
    );

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'The user belonging to this token no longer exists.',
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        error: 'Your account has been deactivated. Please contact support.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[AuthMiddleware] Token verification error:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed. Invalid or expired token.',
    });
  }
};

/**
 * Middleware: Verify Admin Role
 */
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'Access denied: Administrator privileges required.',
  });
};

export default {
  verifyToken,
  isAdmin,
};
