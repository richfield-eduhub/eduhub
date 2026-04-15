/**
 * Request Validation Middleware
 * Validates incoming request data
 */

const { validationResult } = require('express-validator');
const ResponseHandler = require('../utils/responseHandler');

/**
 * Validates request based on express-validator rules
 * Returns 422 with validation errors if validation fails
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return ResponseHandler.validationError(
      res,
      formattedErrors,
      'Validation failed'
    );
  }

  next();
};

/**
 * Sanitize common inputs to prevent XSS
 */
const sanitizeInputs = (req, res, next) => {
  // Trim whitespace from string inputs
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  next();
};

module.exports = {
  validate,
  sanitizeInputs,
};
