/**
 * Admin routes — requires admin role
 */

const express = require('express');
const { query, param, body } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/roleCheck.middleware');
const { validate } = require('../middleware/validator.middleware');
const { APPLICATION_STATUS, PAGINATION } = require('../utils/constants');

const router = express.Router();

const semesterIdParam = [param('id').isUUID().withMessage('Valid semester id required')];
const studentIdParam = [param('id').isUUID().withMessage('Valid student id required')];

const startSemesterValidation = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('year').isInt({ min: 2000, max: 2100 }).withMessage('year must be between 2000 and 2100'),
  body('semester_number')
    .isInt({ min: 1, max: 4 })
    .withMessage('semester_number must be between 1 and 4'),
  body('start_date').optional().isISO8601().withMessage('start_date must be a valid date'),
  body('end_date').optional().isISO8601().withMessage('end_date must be a valid date'),
  body('registration_open').optional().isBoolean().withMessage('registration_open must be a boolean'),
  body('registration_start_date')
    .optional()
    .isISO8601()
    .withMessage('registration_start_date must be a valid date'),
  body('registration_end_date')
    .optional()
    .isISO8601()
    .withMessage('registration_end_date must be a valid date'),
  body('add_drop_deadline')
    .optional()
    .isISO8601()
    .withMessage('add_drop_deadline must be a valid date'),
];

const setRegistrationValidation = [
  ...semesterIdParam,
  body('registration_open')
    .isBoolean()
    .withMessage('registration_open must be a boolean'),
];

const accountStatusValidation = [
  ...studentIdParam,
  body('account_status')
    .isIn(['active', 'blocked', 'suspended'])
    .withMessage('account_status must be active, blocked, or suspended'),
  body('status_reason').optional().isString(),
];

const listApplicationsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: PAGINATION.MAX_LIMIT })
    .withMessage(`Limit must be between 1 and ${PAGINATION.MAX_LIMIT}`),
  query('status')
    .optional()
    .isIn(Object.values(APPLICATION_STATUS))
    .withMessage('Invalid status filter'),
  query('campus_id').optional().isUUID().withMessage('campus_id must be a valid UUID'),
  query('qualification_id')
    .optional()
    .isUUID()
    .withMessage('qualification_id must be a valid UUID'),
  query('search').optional().trim(),
];

const applicationIdParam = [param('id').isUUID().withMessage('Valid application id required')];

const updateStatusValidation = [
  ...applicationIdParam,
  body('status')
    .notEmpty()
    .withMessage('status is required')
    .isIn([
      APPLICATION_STATUS.UNDER_REVIEW,
      APPLICATION_STATUS.APPROVED,
      APPLICATION_STATUS.REJECTED,
      APPLICATION_STATUS.CANCELLED,
    ])
    .withMessage(
      `status must be one of: ${APPLICATION_STATUS.UNDER_REVIEW}, ${APPLICATION_STATUS.APPROVED}, ${APPLICATION_STATUS.REJECTED}, ${APPLICATION_STATUS.CANCELLED}`
    ),
  body('rejection_reason').optional().isString(),
];

router.use(authenticateToken, adminOnly);

router.get(
  '/applications',
  listApplicationsValidation,
  validate,
  adminController.listApplications
);

router.get('/stats/applications', adminController.getApplicationStats);

router.get(
  '/applications/:id',
  applicationIdParam,
  validate,
  adminController.getApplication
);

router.patch(
  '/applications/:id/status',
  updateStatusValidation,
  validate,
  adminController.updateApplicationStatus
);

router.get('/semesters', adminController.listSemesters);

router.post(
  '/semesters',
  startSemesterValidation,
  validate,
  adminController.startSemester
);

router.get(
  '/semesters/:id',
  semesterIdParam,
  validate,
  adminController.getSemester
);

router.post(
  '/semesters/:id/end',
  semesterIdParam,
  validate,
  adminController.endSemester
);

router.patch(
  '/semesters/:id/registration',
  setRegistrationValidation,
  validate,
  adminController.setSemesterRegistration
);

router.patch(
  '/students/:id/account-status',
  accountStatusValidation,
  validate,
  adminController.setStudentAccountStatus
);

module.exports = router;
