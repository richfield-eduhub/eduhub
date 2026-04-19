/**
 * Error Handler Middleware
 * Centralized error handling for the application
 */

/**
 * 404 Not Found Handler
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: 'Not Found',
  });
}

/**
 * Global Error Handler
 */
function errorHandler(err, req, res, next) {
  // Default to 500 server error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error for debugging
  if (statusCode === 500) {
    console.error('[ERROR]', err);
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err,
    }),
  });
}

module.exports = { errorHandler, notFoundHandler };
