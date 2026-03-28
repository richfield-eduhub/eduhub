/**
 * Student Routes
 */

const express = require('express');
const { body, query } = require('express-validator');
const studentController = require('../controllers/student.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { staffOnly, ownerOrStaff, checkRole } = require('../middleware/roleCheck.middleware');
const { validate } = require('../middleware/validator.middleware');
const { LIFECYCLE_STATUS, ACADEMIC_STATUS, USER_ROLES } = require('../utils/constants');

const router = express.Router();

/**
 * Validation rules
 */
const getAllStudentsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(Object.values(LIFECYCLE_STATUS))
    .withMessage(`Status must be one of: ${Object.values(LIFECYCLE_STATUS).join(', ')}`),
];

const updateStudentValidation = [
  body('lifecycle_status')
    .optional()
    .isIn(Object.values(LIFECYCLE_STATUS))
    .withMessage(`Lifecycle status must be one of: ${Object.values(LIFECYCLE_STATUS).join(', ')}`),
  body('academic_status')
    .optional()
    .isIn(Object.values(ACADEMIC_STATUS))
    .withMessage(`Academic status must be one of: ${Object.values(ACADEMIC_STATUS).join(', ')}`),
  body('qualification_id')
    .optional()
    .isUUID()
    .withMessage('Valid qualification ID required'),
  body('expected_graduation')
    .optional()
    .isISO8601()
    .withMessage('Expected graduation must be a valid date'),
  body('graduation_date')
    .optional()
    .isISO8601()
    .withMessage('Graduation date must be a valid date'),
];

/**
 * Routes
 */

// GET /api/students/me - Get current student's profile
router.get(
  '/me',
  authenticateToken,
  checkRole([USER_ROLES.STUDENT]),
  studentController.getMyProfile
);

// GET /api/students - Get all students (staff only)
router.get(
  '/',
  authenticateToken,
  staffOnly,
  getAllStudentsValidation,
  validate,
  studentController.getAllStudents
);

// GET /api/students/:id - Get student by ID (owner or staff)
router.get(
  '/:id',
  authenticateToken,
  ownerOrStaff,
  studentController.getStudentById
);

// PATCH /api/students/:id - Update student (staff only)
router.patch(
  '/:id',
  authenticateToken,
  staffOnly,
  updateStudentValidation,
  validate,
  studentController.updateStudent
);

// GET /api/students/:id/registrations - Get student's registrations (owner or staff)
router.get(
  '/:id/registrations',
  authenticateToken,
  ownerOrStaff,
  studentController.getStudentRegistrations
);

module.exports = router;
