/**
 * Global Error Handler Middleware
 * Catches all errors and sends standardized error responses
 */

const ResponseHandler = require('../utils/responseHandler');

/**
 * Handle Sequelize database errors
 */
const handleSequelizeError = (err, res) => {
  console.error('Sequelize Error:', err.name, err.message);

  switch (err.name) {
    case 'SequelizeValidationError':
      const validationErrors = err.errors.map(e => ({
        field: e.path,
        message: e.message,
        value: e.value,
      }));
      return ResponseHandler.validationError(res, validationErrors);

    case 'SequelizeUniqueConstraintError':
      const field = err.errors[0]?.path || 'field';
      return ResponseHandler.conflict(res, `${field} already exists`);

    case 'SequelizeForeignKeyConstraintError':
      return ResponseHandler.badRequest(
        res,
        'Referenced resource does not exist'
      );

    case 'SequelizeDatabaseError':
      return ResponseHandler.serverError(res, 'Database operation failed');

    default:
      return ResponseHandler.serverError(res);
  }
};

/**
 * Handle JWT errors
 */
const handleJWTError = (err, res) => {
  console.error('JWT Error:', err.name, err.message);

  if (err.name === 'JsonWebTokenError') {
    return ResponseHandler.unauthorized(res, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return ResponseHandler.unauthorized(res, 'Token expired');
  }

  return ResponseHandler.unauthorized(res);
};

/**
 * Global error handler middleware
 * Must be placed after all routes
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error occurred:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Handle Sequelize errors
  if (err.name && err.name.startsWith('Sequelize')) {
    return handleSequelizeError(err, res);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return handleJWTError(err, res);
  }

  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return ResponseHandler.forbidden(res, 'CORS policy violation');
  }

  // Handle custom errors with statusCode property
  if (err.statusCode) {
    if (err.data) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        data: err.data,
      });
    }
    return ResponseHandler.error(res, err.message, err.statusCode);
  }

  // Default to 500 Internal Server Error
  const message =
    process.env.NODE_ENV === 'development'
      ? err.message
      : 'Internal server error';

  return ResponseHandler.serverError(res, message);
};

/**
 * 404 Not Found handler
 * Handles requests to non-existent routes
 */
const notFoundHandler = (req, res) => {
  return ResponseHandler.notFound(
    res,
    `Route ${req.method} ${req.path} not found`
  );
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
