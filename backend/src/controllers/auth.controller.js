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
      const ipAddress = req.ip || req.connection.remoteAddress;

      const result = await authService.login({ email, password, ipAddress });

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

  /**
   * POST /api/auth/send-verification
   * Send email verification
   */
  async sendVerification(req, res, next) {
    try {
      const userId = req.user.user_id;

      const result = await authService.sendEmailVerification(userId);

      return ResponseHandler.success(res, result, 'Verification email sent');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/verify-email
   * Verify email with token
   */
  async verifyEmail(req, res, next) {
    try {
      const { token } = req.body;

      if (!token) {
        return ResponseHandler.badRequest(res, 'Verification token required');
      }

      const result = await authService.verifyEmail(token);

      return ResponseHandler.success(res, result, 'Email verified successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/forgot-password
   * Request password reset
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return ResponseHandler.badRequest(res, 'Email is required');
      }

      const result = await authService.requestPasswordReset(email);

      return ResponseHandler.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/reset-password
   * Reset password with token
   */
  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return ResponseHandler.badRequest(res, 'Token and new password are required');
      }

      const result = await authService.resetPassword(token, password);

      return ResponseHandler.success(res, result, 'Password reset successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/change-password
   * Change password (authenticated user)
   */
  async changePassword(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return ResponseHandler.badRequest(res, 'Current password and new password are required');
      }

      // Verify current password and update
      const bcrypt = require('bcryptjs');
      const sequelize = require('../config/database');
      const PasswordValidator = require('../utils/passwordValidator');

      // Get user's current password
      const users = await sequelize.query(
        `SELECT password_hash FROM users WHERE id = ?`,
        {
          replacements: [userId],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      const user = users[0];
      if (!user) {
        return ResponseHandler.notFound(res, 'User not found');
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValid) {
        return ResponseHandler.unauthorized(res, 'Current password is incorrect');
      }

      // Validate new password
      const validation = PasswordValidator.validate(newPassword);
      if (!validation.isValid) {
        return ResponseHandler.badRequest(res, 'Password does not meet requirements', {
          errors: validation.errors,
        });
      }

      // Hash and update password
      const newPasswordHash = await bcrypt.hash(newPassword, 12);
      await sequelize.query(
        `UPDATE users
         SET password_hash = ?,
             is_default_password = false,
             require_password_change = false,
             last_password_change = NOW()
         WHERE id = ?`,
        { replacements: [newPasswordHash, userId] }
      );

      return ResponseHandler.success(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
