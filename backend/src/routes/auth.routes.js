/**
 * Authentication Routes
 */

const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validator.middleware');
const { USER_ROLES } = require('../utils/constants');

const router = express.Router();

/**
 * Validation rules
 */
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be 2-50 characters'),
  body('last_name')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be 2-50 characters'),
  body('role')
    .optional()
    .isIn(Object.values(USER_ROLES))
    .withMessage(`Role must be one of: ${Object.values(USER_ROLES).join(', ')}`),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
];

/**
 * Routes
 */

// POST /api/auth/register - Register new user
router.post(
  '/register',
  registerValidation,
  validate,
  authController.register
);

// POST /api/auth/login - Login user
router.post(
  '/login',
  loginValidation,
  validate,
  authController.login
);

// POST /api/auth/refresh - Refresh access token
router.post(
  '/refresh',
  refreshTokenValidation,
  validate,
  authController.refreshToken
);

// GET /api/auth/profile - Get current user profile
router.get(
  '/profile',
  authenticateToken,
  authController.getProfile
);

// POST /api/auth/logout - Logout user
router.post(
  '/logout',
  authenticateToken,
  authController.logout
);

module.exports = router;
