/**
 * Emergency Contact Routes
 *
 * Handles emergency contact management endpoints
 */

const express = require('express');
const { body } = require('express-validator');
const emergencyContactController = require('../controllers/emergencyContact.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validator.middleware');

const router = express.Router();

/**
 * Validation rules
 */
const createContactValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name must not exceed 100 characters'),
  body('relationship')
    .notEmpty()
    .withMessage('Relationship is required')
    .isLength({ max: 50 })
    .withMessage('Relationship must not exceed 50 characters'),
  body('phone')
    .notEmpty()
    .withMessage('Phone is required')
    .isLength({ max: 20 })
    .withMessage('Phone must not exceed 20 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address'),
  body('address')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Address must not exceed 255 characters'),
  body('is_primary')
    .optional()
    .isBoolean()
    .withMessage('is_primary must be a boolean'),
];

const updateContactValidation = [
  body('name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Name must not exceed 100 characters'),
  body('relationship')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Relationship must not exceed 50 characters'),
  body('phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Phone must not exceed 20 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address'),
  body('address')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Address must not exceed 255 characters'),
  body('is_primary')
    .optional()
    .isBoolean()
    .withMessage('is_primary must be a boolean'),
];

// ============================================
// Emergency Contact Routes
// ============================================

// GET /api/students/:studentId/emergency-contacts - Get all contacts
router.get(
  '/students/:studentId/emergency-contacts',
  authenticateToken,
  emergencyContactController.getStudentContacts
);

// GET /api/students/:studentId/emergency-contacts/:contactId - Get specific contact
router.get(
  '/students/:studentId/emergency-contacts/:contactId',
  authenticateToken,
  emergencyContactController.getContact
);

// POST /api/students/:studentId/emergency-contacts - Create contact
router.post(
  '/students/:studentId/emergency-contacts',
  authenticateToken,
  createContactValidation,
  validate,
  emergencyContactController.createContact
);

// PUT /api/students/:studentId/emergency-contacts/:contactId - Update contact
router.put(
  '/students/:studentId/emergency-contacts/:contactId',
  authenticateToken,
  updateContactValidation,
  validate,
  emergencyContactController.updateContact
);

// DELETE /api/students/:studentId/emergency-contacts/:contactId - Delete contact
router.delete(
  '/students/:studentId/emergency-contacts/:contactId',
  authenticateToken,
  emergencyContactController.deleteContact
);

// POST /api/students/:studentId/emergency-contacts/:contactId/set-primary - Set as primary
router.post(
  '/students/:studentId/emergency-contacts/:contactId/set-primary',
  authenticateToken,
  emergencyContactController.setPrimaryContact
);

module.exports = router;
