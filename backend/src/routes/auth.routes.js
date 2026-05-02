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
// SA phone: local 0[6-8]XXXXXXXX or international +27[6-8]XXXXXXXX
const SA_PHONE_RE = /^\+?27[6-8]\d{8}$|^0[6-8]\d{8}$/;

// SA ID: 13 digits with Luhn-style checksum
function isValidSAId(id) {
  if (!/^\d{13}$/.test(id)) return false;
  const mm = parseInt(id.slice(2, 4), 10);
  const dd = parseInt(id.slice(4, 6), 10);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return false;
  let odd = 0, even = '';
  for (let i = 0; i < 12; i++) {
    if (i % 2 === 0) odd += parseInt(id[i], 10);
    else even += id[i];
  }
  const evenSum = (parseInt(even, 10) * 2).toString().split('').reduce((a, c) => a + parseInt(c, 10), 0);
  const check = (10 - ((odd + evenSum) % 10)) % 10;
  return check === parseInt(id[12], 10);
}

const registerValidation = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Enter a valid email address (e.g. you@example.com).'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number.'),
  body('first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required.')
    .isLength({ min: 2, max: 60 })
    .withMessage('First name must be between 2 and 60 characters.')
    .matches(/^[A-Za-z\u00C0-\u024F'\- ]+$/)
    .withMessage('First name may only contain letters, hyphens, apostrophes and spaces.'),
  body('last_name')
    .trim()
    .notEmpty()
    .withMessage('Last name is required.')
    .isLength({ min: 2, max: 60 })
    .withMessage('Last name must be between 2 and 60 characters.')
    .matches(/^[A-Za-z\u00C0-\u024F'\- ]+$/)
    .withMessage('Last name may only contain letters, hyphens, apostrophes and spaces.'),
  body('phone')
    .optional({ checkFalsy: true })
    .custom((value) => {
      const digits = value.replace(/[\s\-().]/g, '');
      if (!SA_PHONE_RE.test(digits)) {
        throw new Error('Enter a valid South African phone number (e.g. 071 234 5678 or +27 71 234 5678).');
      }
      return true;
    }),
  body('id_number')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (!isValidSAId(value.replace(/\s/g, ''))) {
        throw new Error('SA ID number is invalid. Must be 13 digits with a valid checksum.');
      }
      return true;
    }),
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
