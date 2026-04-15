/**
 * Public application routes (prospective students — no auth)
 */

const express = require('express');
const { body, query, param } = require('express-validator');
const applicationController = require('../controllers/application.controller');
const { validate } = require('../middleware/validator.middleware');
const { APPLICATION_STATUS } = require('../utils/constants');

const router = express.Router();

const ADMISSION_FOR_VALUES = [
  '1st Semester',
  '2nd Semester',
  '1st Year',
  '2nd Year',
  '3rd Year',
];

const APPLICATION_TYPE_VALUES = ['new', 'returning', 'transfer', 'other'];

const GENDER_VALUES = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

const createApplicationValidation = [
  body('campus_id').isUUID().withMessage('Valid campus_id is required'),
  body('qualification_id').isUUID().withMessage('Valid qualification_id is required'),
  body('first_name').trim().notEmpty().withMessage('first_name is required'),
  body('last_name').trim().notEmpty().withMessage('last_name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('phone is required'),
  body('id_number').optional().trim(),
  body('passport_number').optional().trim(),
  body('nationality').optional().trim(),
  body('date_of_birth').optional().isISO8601(),
  body('gender').optional().isIn(GENDER_VALUES),
  body('alt_email').optional().isEmail().normalizeEmail(),
  body('street_address').optional().trim(),
  body('suburb').optional().trim(),
  body('city').optional().trim(),
  body('province').optional().trim(),
  body('postal_code').optional().trim(),
  body('study_year').optional().isInt({ min: 1, max: 3 }),
  body('docs_uploaded').optional(),
  body('tc_accepted')
    .optional()
    .isBoolean()
    .withMessage('tc_accepted must be a boolean'),
  body('status')
    .optional()
    .isIn([APPLICATION_STATUS.DRAFT, APPLICATION_STATUS.PENDING])
    .withMessage(`status must be ${APPLICATION_STATUS.DRAFT} or ${APPLICATION_STATUS.PENDING}`),
  body('application_type')
    .optional()
    .isIn(APPLICATION_TYPE_VALUES)
    .withMessage('Invalid application_type'),
  body('admission_for')
    .optional()
    .isIn(ADMISSION_FOR_VALUES)
    .withMessage('Invalid admission_for'),
];

const lookupQueryValidation = [
  query('reference_number').trim().notEmpty().withMessage('reference_number is required'),
  query('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

const accessQueryValidation = [
  query('reference_number').trim().notEmpty().withMessage('reference_number is required'),
  query('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

const idParamValidation = [param('id').isUUID().withMessage('Valid application id required')];

router.post('/', createApplicationValidation, validate, applicationController.createApplication);

router.get(
  '/lookup',
  lookupQueryValidation,
  validate,
  applicationController.lookupApplication
);

router.get(
  '/:id',
  [...idParamValidation, ...accessQueryValidation],
  validate,
  applicationController.getApplication
);

router.patch(
  '/:id',
  [...idParamValidation, ...accessQueryValidation],
  validate,
  applicationController.updateApplication
);

module.exports = router;
