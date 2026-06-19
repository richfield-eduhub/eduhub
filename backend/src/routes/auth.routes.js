/**
 * Authentication Routes
 */

const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const mfaController = require('../controllers/mfa.controller');
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

// ============================================
// Email Verification Routes
// ============================================

// POST /api/auth/send-verification - Send verification email
router.post(
  '/send-verification',
  authenticateToken,
  authController.sendVerification
);

// POST /api/auth/verify-email - Verify email with token
router.post(
  '/verify-email',
  [body('token').notEmpty().withMessage('Verification token is required')],
  validate,
  authController.verifyEmail
);

// ============================================
// Password Reset Routes
// ============================================

// POST /api/auth/forgot-password - Request password reset
router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
  validate,
  authController.forgotPassword
);

// POST /api/auth/reset-password - Reset password with token
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
  ],
  validate,
  authController.resetPassword
);

// POST /api/auth/change-password - Change password (authenticated)
router.post(
  '/change-password',
  authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
  ],
  validate,
  authController.changePassword
);

// ============================================
// Multi-Factor Authentication (MFA) Routes
// ============================================

// POST /api/auth/mfa/setup - Initiate MFA setup
router.post(
  '/mfa/setup',
  authenticateToken,
  mfaController.setupMFA
);

// POST /api/auth/mfa/verify-setup - Verify and activate MFA
router.post(
  '/mfa/verify-setup',
  authenticateToken,
  [body('code').notEmpty().withMessage('Verification code is required')],
  validate,
  mfaController.verifySetup
);

// POST /api/auth/mfa/verify - Verify MFA code during login
router.post(
  '/mfa/verify',
  [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('code').notEmpty().withMessage('MFA code is required'),
  ],
  validate,
  mfaController.verifyMFA
);

// GET /api/auth/mfa/status - Get MFA status
router.get(
  '/mfa/status',
  authenticateToken,
  mfaController.getMFAStatus
);

// POST /api/auth/mfa/disable - Disable MFA
router.post(
  '/mfa/disable',
  authenticateToken,
  [body('password').notEmpty().withMessage('Password is required')],
  validate,
  mfaController.disableMFA
);

// POST /api/auth/mfa/regenerate-codes - Regenerate backup codes
router.post(
  '/mfa/regenerate-codes',
  authenticateToken,
  [body('password').notEmpty().withMessage('Password is required')],
  validate,
  mfaController.regenerateBackupCodes
);

module.exports = router;
