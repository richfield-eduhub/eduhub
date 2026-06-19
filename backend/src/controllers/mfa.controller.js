/**
 * Multi-Factor Authentication (MFA) Controller
 * Handles MFA-related endpoints
 */

const mfaService = require('../services/mfa.service');
const ResponseHandler = require('../utils/responseHandler');

class MFAController {
  /**
   * POST /api/auth/mfa/setup
   * Initiate MFA setup
   */
  async setupMFA(req, res, next) {
    try {
      const userId = req.user.user_id;

      const result = await mfaService.enableMFA(userId);

      return ResponseHandler.success(res, result, 'MFA setup initiated');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/mfa/verify-setup
   * Verify and activate MFA
   */
  async verifySetup(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { code } = req.body;

      if (!code) {
        return ResponseHandler.badRequest(res, 'Verification code is required');
      }

      const result = await mfaService.verifyAndActivateMFA(userId, code);

      return ResponseHandler.success(res, result, 'MFA enabled successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/mfa/verify
   * Verify MFA code during login
   */
  async verifyMFA(req, res, next) {
    try {
      const { userId, code, useBackupCode } = req.body;

      if (!userId || !code) {
        return ResponseHandler.badRequest(res, 'User ID and code are required');
      }

      const result = await mfaService.verifyMFALogin(userId, code, useBackupCode);

      // Generate JWT tokens after successful MFA verification
      const authService = require('../services/auth.service');
      const sequelize = require('../config/database');

      const users = await sequelize.query(
        `SELECT id as user_id, email, role FROM users WHERE id = ?`,
        {
          replacements: [userId],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      const user = users[0];
      if (!user) {
        return ResponseHandler.notFound(res, 'User not found');
      }

      const tokens = authService.generateTokens({
        user_id: user.user_id,
        email: user.email,
        role: user.role,
      });

      return ResponseHandler.success(
        res,
        { ...result, ...tokens },
        'MFA verification successful'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/mfa/disable
   * Disable MFA
   */
  async disableMFA(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { password } = req.body;

      if (!password) {
        return ResponseHandler.badRequest(res, 'Password is required to disable MFA');
      }

      const result = await mfaService.disableMFA(userId, password);

      return ResponseHandler.success(res, result, 'MFA disabled successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/mfa/regenerate-codes
   * Regenerate backup codes
   */
  async regenerateBackupCodes(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { password } = req.body;

      if (!password) {
        return ResponseHandler.badRequest(res, 'Password is required to regenerate backup codes');
      }

      const result = await mfaService.regenerateBackupCodes(userId, password);

      return ResponseHandler.success(res, result, 'Backup codes regenerated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/mfa/status
   * Check MFA status for current user
   */
  async getMFAStatus(req, res, next) {
    try {
      const userId = req.user.user_id;
      const sequelize = require('../config/database');

      const users = await sequelize.query(
        `SELECT mfa_enabled, mfa_setup_at FROM users WHERE id = ?`,
        {
          replacements: [userId],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      const user = users[0];
      if (!user) {
        return ResponseHandler.notFound(res, 'User not found');
      }

      return ResponseHandler.success(res, {
        mfaEnabled: user.mfa_enabled || false,
        setupAt: user.mfa_setup_at,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MFAController();
