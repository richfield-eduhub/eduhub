/**
 * Announcement Routes
 *
 * Handles announcement endpoints for lecturers and students
 */

const express = require('express');
const { body, query } = require('express-validator');
const announcementController = require('../controllers/announcement.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/roleCheck.middleware');
const { validate } = require('../middleware/validator.middleware');

const router = express.Router();

/**
 * Validation rules
 */
const createAnnouncementValidation = [
  body('moduleId')
    .notEmpty()
    .withMessage('Module ID is required')
    .isUUID()
    .withMessage('Invalid module ID'),
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, normal, high, urgent'),
];

const updateAnnouncementValidation = [
  body('title')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),
  body('content')
    .optional()
    .isString()
    .withMessage('Content must be a string'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, normal, high, urgent'),
];

const paginationValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
];

// ============================================
// Announcement Routes
// ============================================

// POST /api/announcements - Create announcement (lecturer only)
router.post(
  '/announcements',
  authenticateToken,
  checkRole(['lecturer', 'admin']),
  createAnnouncementValidation,
  validate,
  announcementController.createAnnouncement
);

// GET /api/announcements/:id - Get announcement by ID
router.get(
  '/announcements/:id',
  authenticateToken,
  announcementController.getAnnouncement
);

// PUT /api/announcements/:id - Update announcement (lecturer only, own announcements)
router.put(
  '/announcements/:id',
  authenticateToken,
  checkRole(['lecturer', 'admin']),
  updateAnnouncementValidation,
  validate,
  announcementController.updateAnnouncement
);

// DELETE /api/announcements/:id - Delete announcement (lecturer only, own announcements)
router.delete(
  '/announcements/:id',
  authenticateToken,
  checkRole(['lecturer', 'admin']),
  announcementController.deleteAnnouncement
);

// GET /api/modules/:moduleId/announcements - Get announcements for a module
router.get(
  '/modules/:moduleId/announcements',
  authenticateToken,
  paginationValidation,
  validate,
  announcementController.getModuleAnnouncements
);

// GET /api/students/me/announcements - Get announcements for current student
router.get(
  '/students/me/announcements',
  authenticateToken,
  checkRole(['student']),
  paginationValidation,
  validate,
  announcementController.getMyAnnouncements
);

// GET /api/lecturers/me/announcements - Get announcements created by current lecturer
router.get(
  '/lecturers/me/announcements',
  authenticateToken,
  checkRole(['lecturer', 'admin']),
  paginationValidation,
  validate,
  announcementController.getMyCreatedAnnouncements
);

module.exports = router;
