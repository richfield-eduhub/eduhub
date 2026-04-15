/**
 * Standardized API Response Handlers
 * Ensures consistent response format across all endpoints
 */

class ResponseHandler {
  /**
   * Success response (200, 201, etc.)
   */
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Created response (201)
   */
  static created(res, data, message = 'Resource created successfully') {
    return ResponseHandler.success(res, data, message, 201);
  }

  /**
   * Error response (400, 401, 403, 404, 500, etc.)
   */
  static error(res, message = 'An error occurred', statusCode = 500, errors = null) {
    const response = {
      success: false,
      message,
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Bad Request (400)
   */
  static badRequest(res, message = 'Bad request', errors = null) {
    return ResponseHandler.error(res, message, 400, errors);
  }

  /**
   * Unauthorized (401)
   */
  static unauthorized(res, message = 'Unauthorized access') {
    return ResponseHandler.error(res, message, 401);
  }

  /**
   * Forbidden (403)
   */
  static forbidden(res, message = 'Access forbidden') {
    return ResponseHandler.error(res, message, 403);
  }

  /**
   * Not Found (404)
   */
  static notFound(res, message = 'Resource not found') {
    return ResponseHandler.error(res, message, 404);
  }

  /**
   * Conflict (409)
   */
  static conflict(res, message = 'Resource conflict') {
    return ResponseHandler.error(res, message, 409);
  }

  /**
   * Validation Error (422)
   */
  static validationError(res, errors, message = 'Validation failed') {
    return ResponseHandler.error(res, message, 422, errors);
  }

  /**
   * Internal Server Error (500)
   */
  static serverError(res, message = 'Internal server error') {
    return ResponseHandler.error(res, message, 500);
  }

  /**
   * Paginated response
   */
  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit),
      },
    });
  }
}

module.exports = ResponseHandler;
