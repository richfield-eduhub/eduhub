/**
 * Role-Based Access Control Middleware
 * Checks if authenticated user has required role
 */

const ResponseHandler = require('../utils/responseHandler');
const { USER_ROLES } = require('../utils/constants');

/**
 * Check if user has one of the required roles
 * @param {Array<string>} roles - Array of allowed roles
 */
const checkRole = (roles) => {
  return (req, res, next) => {
    // Ensure user is authenticated first
    if (!req.user) {
      return ResponseHandler.unauthorized(res, 'Authentication required');
    }

    // Check if user's role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      return ResponseHandler.forbidden(
        res,
        `Access denied. Required role(s): ${roles.join(', ')}`
      );
    }

    next();
  };
};

/**
 * Admin-only access
 */
const adminOnly = checkRole([USER_ROLES.ADMIN]);

/**
 * Admin or Lecturer access
 */
const staffOnly = checkRole([USER_ROLES.ADMIN, USER_ROLES.LECTURER]);

/**
 * Any authenticated user
 */
const authenticatedOnly = checkRole([
  USER_ROLES.ADMIN,
  USER_ROLES.LECTURER,
  USER_ROLES.STUDENT,
]);

/**
 * Check if user is accessing their own resource
 * Compares req.params.userId or req.params.id with req.user.user_id
 */
const checkOwnership = (req, res, next) => {
  const resourceUserId = req.params.userId || req.params.id;
  const currentUserId = req.user.user_id;

  // Admin can access any resource
  if (req.user.role === USER_ROLES.ADMIN) {
    return next();
  }

  // Check if user owns the resource
  if (resourceUserId !== currentUserId) {
    return ResponseHandler.forbidden(res, 'You can only access your own resources');
  }

  next();
};

/**
 * Check if user is accessing their own resource OR is staff
 */
const ownerOrStaff = (req, res, next) => {
  const resourceUserId = req.params.userId || req.params.id;
  const currentUserId = req.user.user_id;

  // Admin or Lecturer can access any resource
  if ([USER_ROLES.ADMIN, USER_ROLES.LECTURER].includes(req.user.role)) {
    return next();
  }

  // Check if user owns the resource
  if (resourceUserId !== currentUserId) {
    return ResponseHandler.forbidden(res, 'Access denied');
  }

  next();
};

module.exports = {
  checkRole,
  adminOnly,
  staffOnly,
  authenticatedOnly,
  checkOwnership,
  ownerOrStaff,
};
