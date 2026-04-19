/**
 * Lecturer Routes
 * Endpoints for lecturer management
 */

const express = require('express');
const router = express.Router();
const { param, query } = require('express-validator');
const lecturerController = require('../controllers/lecturer.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { adminOnly, staffOnly } = require('../middleware/roleCheck.middleware');
const { validate } = require('../middleware/validator.middleware');

/**
 * Validation rules
 */
const getAllLecturersValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('campus_id').optional().isUUID().withMessage('Valid campus ID required'),
  query('search').optional().isString().withMessage('Search must be a string'),
];

const lecturerIdValidation = [
  param('id').isUUID().withMessage('Valid lecturer ID required'),
];

const updateLecturerValidation = [
  param('id').isUUID().withMessage('Valid lecturer ID required'),
];

const getModulesValidation = [
  query('semester_id').optional().isUUID().withMessage('Valid semester ID required'),
  query('active_only').optional().isBoolean().withMessage('active_only must be a boolean'),
];

/**
 * Routes
 */

/**
 * @route   GET /api/lecturers/me/modules
 * @desc    Get current lecturer's assigned modules
 * @access  Lecturer Only
 */
router.get(
  '/me/modules',
  authenticateToken,
  getModulesValidation,
  validate,
  lecturerController.getMyModules
);

/**
 * @route   GET /api/lecturers/me
 * @desc    Get current lecturer's profile
 * @access  Lecturer Only
 */
router.get('/me', authenticateToken, lecturerController.getMyProfile);

/**
 * @route   GET /api/lecturers/:id/modules
 * @desc    Get lecturer's assigned modules by ID
 * @access  Staff Only (Admin or Lecturer)
 */
router.get(
  '/:id/modules',
  authenticateToken,
  staffOnly,
  lecturerIdValidation,
  getModulesValidation,
  validate,
  lecturerController.getLecturerModules
);

/**
 * @route   GET /api/lecturers/:id
 * @desc    Get lecturer by ID
 * @access  Staff Only (Admin or Lecturer)
 */
router.get(
  '/:id',
  authenticateToken,
  staffOnly,
  lecturerIdValidation,
  validate,
  lecturerController.getLecturerById
);

/**
 * @route   GET /api/lecturers
 * @desc    Get all lecturers
 * @access  Staff Only (Admin or Lecturer)
 */
router.get(
  '/',
  authenticateToken,
  staffOnly,
  getAllLecturersValidation,
  validate,
  lecturerController.getAllLecturers
);

/**
 * @route   PATCH /api/lecturers/:id
 * @desc    Update lecturer information
 * @access  Admin Only
 */
router.patch(
  '/:id',
  authenticateToken,
  adminOnly,
  updateLecturerValidation,
  validate,
  lecturerController.updateLecturer
);

module.exports = router;
