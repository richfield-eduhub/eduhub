/**
 * Input Validation and Sanitization Middleware
 */

/**
 * Sanitize user inputs to prevent XSS attacks
 * Strips potentially dangerous HTML tags and scripts
 */
function sanitizeInputs(req, res, next) {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      // Remove script tags and their content
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .trim();
    }
    return value;
  };

  const sanitizeObject = (obj) => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeValue(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      });
    }
  };

  // Sanitize request body
  if (req.body) {
    sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    sanitizeObject(req.query);
  }

  // Sanitize URL parameters
  if (req.params) {
    sanitizeObject(req.params);
  }

  next();
}

/**
 * Validation middleware using express-validator
 * Checks for validation errors and returns 400 if any exist
 */
const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
}

module.exports = { sanitizeInputs, validate };
