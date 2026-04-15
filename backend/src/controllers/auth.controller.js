/**
 * Authentication Controller
 * Handles authentication endpoints
 */

const authService = require('../services/auth.service');
const ResponseHandler = require('../utils/responseHandler');

class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  async register(req, res, next) {
    try {
      const { email, password, first_name, last_name, role } = req.body;

      const result = await authService.register({
        email,
        password,
        first_name,
        last_name,
        role,
      });

      return ResponseHandler.created(res, result, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Login user
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await authService.login({ email, password });

      return ResponseHandler.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh
   * Refresh access token
   */
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return ResponseHandler.badRequest(res, 'Refresh token required');
      }

      const tokens = await authService.refreshToken(refreshToken);

      return ResponseHandler.success(res, tokens, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/profile
   * Get current user profile
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.user.user_id;

      const profile = await authService.getProfile(userId);

      return ResponseHandler.success(res, profile, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   * Logout user (client-side token removal, server can blacklist if needed)
   */
  async logout(req, res, next) {
    try {
      // In a stateless JWT system, logout is typically handled client-side
      // by removing the token. For added security, you could implement
      // token blacklisting here if needed.

      return ResponseHandler.success(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
