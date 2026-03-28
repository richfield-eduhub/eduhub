/**
 * Qualification Routes
 */

const express = require('express');
const { query } = require('express-validator');
const qualificationController = require('../controllers/qualification.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validator.middleware');

const router = express.Router();

/**
 * Validation rules
 */
const getAllQualificationsValidation = [
  query('active_only')
    .optional()
    .isBoolean()
    .withMessage('active_only must be a boolean'),
];

/**
 * Routes
 */

// GET /api/qualifications - Get all qualifications (authenticated users)
router.get(
  '/',
  authenticateToken,
  getAllQualificationsValidation,
  validate,
  qualificationController.getAllQualifications
);

// GET /api/qualifications/:id - Get qualification by ID (authenticated users)
router.get(
  '/:id',
  authenticateToken,
  qualificationController.getQualificationById
);

module.exports = router;
