/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user info to request
 */

const jwt = require('jsonwebtoken');
const ResponseHandler = require('../utils/responseHandler');

/**
 * Verify JWT token and attach user to request
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      return ResponseHandler.unauthorized(res, 'Access token required');
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return ResponseHandler.unauthorized(res, 'Token expired');
        }
        return ResponseHandler.unauthorized(res, 'Invalid token');
      }

      // Attach user to request
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return ResponseHandler.serverError(res, 'Authentication failed');
  }
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that work differently for authenticated users
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        req.user = null;
      } else {
        req.user = user;
      }
      next();
    });
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
};
