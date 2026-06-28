/**
 * Authentication Service
 * Handles business logic for authentication operations
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sequelize = require('../config/database');
const { JWT, USER_ROLES, ACCOUNT_STATUS } = require('../utils/constants');
const PasswordValidator = require('../utils/passwordValidator');
const { normalizeContactEmail, assertContactAvailable } = require('../utils/contactValidator');
const emailService = require('./email.service');
const AuditService = require('./audit.service');

class AuthService {
  /**
   * Register a new user
   */
  async register({ email, password, first_name, last_name, role = USER_ROLES.STUDENT }) {
    const transaction = await sequelize.transaction();

    try {
      // Validate password strength
      const passwordValidation = PasswordValidator.validate(password);
      if (!passwordValidation.isValid) {
        throw {
          statusCode: 400,
          message: 'Password does not meet security requirements',
          errors: passwordValidation.errors,
        };
      }

      // Check if user already exists
      const normalizedEmail = normalizeContactEmail(email);
      const [existingUser] = await sequelize.query(
        'SELECT id FROM users WHERE LOWER(TRIM(email)) = ?',
        {
          replacements: [normalizedEmail],
          type: sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      if (existingUser) {
        throw { statusCode: 409, message: 'Email already registered' };
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 12);

      // Create user
      const [results] = await sequelize.query(
        `INSERT INTO users (email, password_hash, role, account_status, is_verified)
         VALUES (?, ?, ?, ?, ?)
         RETURNING id as user_id, email, role, account_status, created_at`,
        {
          replacements: [normalizedEmail, password_hash, role, ACCOUNT_STATUS.ACTIVE, false],
          transaction,
        }
      );

      const newUser = results[0];

      // Create user details (with minimal required fields)
      await sequelize.query(
        `INSERT INTO user_details (user_id, first_name, last_name, date_of_birth, phone)
         VALUES (?, ?, ?, ?, ?)`,
        {
          replacements: [newUser.user_id, first_name, last_name, '2000-01-01', '0000000000'],
          transaction,
        }
      );

      await transaction.commit();

      // Generate tokens
      const tokens = this.generateTokens({
        user_id: newUser.user_id,
        email: newUser.email,
        role: newUser.role,
      });

      return {
        user: {
          user_id: newUser.user_id,
          email: newUser.email,
          role: newUser.role,
          first_name,
          last_name,
        },
        ...tokens,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Login user
   */
  async login({ email, password, ipAddress = null }) {
    // Get user with password hash and failed login tracking (including MFA status)
    const users = await sequelize.query(
      `SELECT u.id as user_id, u.email, u.password_hash, u.role, u.account_status,
              u.is_default_password, u.require_password_change,
              u.failed_login_attempts, u.last_failed_login,
              u.mfa_enabled,
              ud.first_name, ud.last_name
       FROM users u
       LEFT JOIN user_details ud ON u.id = ud.user_id
       WHERE u.email = ?`,
      {
        replacements: [email],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const user = users[0];

    if (!user) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    // Check if account is locked due to failed login attempts
    const maxAttempts = 5;
    const lockoutDuration = 15 * 60 * 1000; // 15 minutes in milliseconds

    if (user.failed_login_attempts >= maxAttempts) {
      const timeSinceLastFailed = Date.now() - new Date(user.last_failed_login).getTime();

      if (timeSinceLastFailed < lockoutDuration) {
        const minutesRemaining = Math.ceil((lockoutDuration - timeSinceLastFailed) / 60000);
        throw {
          statusCode: 403,
          message: `Account temporarily locked due to multiple failed login attempts. Please try again in ${minutesRemaining} minute(s).`,
        };
      } else {
        // Reset failed attempts after lockout period
        await sequelize.query(
          `UPDATE users SET failed_login_attempts = 0, last_failed_login = NULL WHERE id = ?`,
          { replacements: [user.user_id] }
        );
      }
    }

    // Check account status
    if (user.account_status !== ACCOUNT_STATUS.ACTIVE) {
      throw {
        statusCode: 403,
        message: `Account is ${user.account_status}. Please contact support.`,
      };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      // Increment failed login attempts
      const newFailedAttempts = (user.failed_login_attempts || 0) + 1;
      await sequelize.query(
        `UPDATE users
         SET failed_login_attempts = ?, last_failed_login = NOW()
         WHERE id = ?`,
        { replacements: [newFailedAttempts, user.user_id] }
      );

      const remainingAttempts = maxAttempts - newFailedAttempts;
      if (remainingAttempts > 0) {
        throw {
          statusCode: 401,
          message: `Invalid email or password. ${remainingAttempts} attempt(s) remaining before account lockout.`,
        };
      } else {
        throw {
          statusCode: 403,
          message: 'Account locked due to multiple failed login attempts. Please try again in 15 minutes.',
        };
      }
    }

    // Successful password verification - reset failed attempts
    await sequelize.query(
      `UPDATE users
       SET failed_login_attempts = 0,
           last_failed_login = NULL
       WHERE id = ?`,
      { replacements: [user.user_id] }
    );

    // Check if MFA is enabled
    if (user.mfa_enabled) {
      // MFA is enabled - require MFA verification before issuing tokens
      return {
        mfaRequired: true,
        userId: user.user_id,
        email: user.email,
        message: 'MFA verification required. Please enter your 6-digit code.',
      };
    }

    // MFA not enabled - update last login and generate tokens
    await sequelize.query(
      `UPDATE users
       SET last_login = NOW(),
           last_login_ip = ?
       WHERE id = ?`,
      { replacements: [ipAddress, user.user_id] }
    );

    // Log successful login
    await AuditService.logLogin(user.user_id, ipAddress, null, true);

    // Generate tokens
    const tokens = this.generateTokens({
      user_id: user.user_id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        tempPassword: Boolean(user.require_password_change || user.is_default_password),
      },
      ...tokens,
    };
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId) {
    const users = await sequelize.query(
      `SELECT u.id as user_id, u.email, u.role, u.account_status, u.is_verified as email_verified, u.created_at,
              u.is_default_password, u.require_password_change,
              ud.first_name, ud.last_name, ud.date_of_birth, ud.phone, ud.id_number, ud.nationality, ud.gender
       FROM users u
       LEFT JOIN user_details ud ON u.id = ud.user_id
       WHERE u.id = ?`,
      {
        replacements: [userId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const user = users[0];

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    return {
      ...user,
      tempPassword: Boolean(user.require_password_change || user.is_default_password),
    };
  }

  /**
   * Generate access and refresh tokens
   */
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: JWT.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
      expiresIn: JWT.REFRESH_TOKEN_EXPIRY,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: JWT.ACCESS_TOKEN_EXPIRY,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
      );

      // Generate new tokens
      const tokens = this.generateTokens({
        user_id: decoded.user_id,
        email: decoded.email,
        role: decoded.role,
      });

      return tokens;
    } catch (error) {
      throw { statusCode: 401, message: 'Invalid or expired refresh token' };
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(userId) {
    const users = await sequelize.query(
      `SELECT u.email, u.is_verified, ud.first_name, ud.last_name
       FROM users u
       LEFT JOIN user_details ud ON u.id = ud.user_id
       WHERE u.id = ?`,
      {
        replacements: [userId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const user = users[0];

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    if (user.is_verified) {
      throw { statusCode: 400, message: 'Email already verified' };
    }

    // Generate verification token (expires in 24 hours)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token in database
    await sequelize.query(
      `UPDATE users
       SET verification_token = ?,
           verification_expires = ?
       WHERE id = ?`,
      { replacements: [verificationToken, expiresAt, userId] }
    );

    // Send email
    await emailService.sendVerificationEmail({
      to: user.email,
      fullName: `${user.first_name} ${user.last_name}`,
      verificationToken,
    });

    return { message: 'Verification email sent successfully' };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token) {
    const users = await sequelize.query(
      `SELECT id, email, is_verified, verification_token, verification_expires
       FROM users
       WHERE verification_token = ?`,
      {
        replacements: [token],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const user = users[0];

    if (!user) {
      throw { statusCode: 400, message: 'Invalid verification token' };
    }

    if (user.is_verified) {
      throw { statusCode: 400, message: 'Email already verified' };
    }

    if (new Date() > new Date(user.verification_expires)) {
      throw { statusCode: 400, message: 'Verification token expired. Please request a new one.' };
    }

    // Mark email as verified
    await sequelize.query(
      `UPDATE users
       SET is_verified = true,
           verification_token = NULL,
           verification_expires = NULL,
           account_status = ?
       WHERE id = ?`,
      { replacements: [ACCOUNT_STATUS.ACTIVE, user.id] }
    );

    return { message: 'Email verified successfully' };
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email) {
    const users = await sequelize.query(
      `SELECT u.id, u.email, u.account_status, ud.first_name, ud.last_name
       FROM users u
       LEFT JOIN user_details ud ON u.id = ud.user_id
       WHERE u.email = ?`,
      {
        replacements: [email],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const user = users[0];

    if (!user) {
      // Don't reveal if user exists - security best practice
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token in database
    await sequelize.query(
      `UPDATE users
       SET password_reset_token = ?,
           password_reset_expires = ?
       WHERE id = ?`,
      { replacements: [resetToken, expiresAt, user.id] }
    );

    // Send email
    await emailService.sendPasswordResetEmail({
      to: user.email,
      fullName: `${user.first_name} ${user.last_name}`,
      resetToken,
    });

    return { message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    // Validate new password
    const passwordValidation = PasswordValidator.validate(newPassword);
    if (!passwordValidation.isValid) {
      throw {
        statusCode: 400,
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors,
      };
    }

    const users = await sequelize.query(
      `SELECT id, email, password_reset_token, password_reset_expires
       FROM users
       WHERE password_reset_token = ?`,
      {
        replacements: [token],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const user = users[0];

    if (!user) {
      throw { statusCode: 400, message: 'Invalid reset token' };
    }

    if (new Date() > new Date(user.password_reset_expires)) {
      throw { statusCode: 400, message: 'Reset token expired. Please request a new one.' };
    }

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await sequelize.query(
      `UPDATE users
       SET password_hash = ?,
           password_reset_token = NULL,
           password_reset_expires = NULL,
           is_default_password = false,
           require_password_change = false,
           last_password_change = NOW()
       WHERE id = ?`,
      { replacements: [password_hash, user.id] }
    );

    return { message: 'Password reset successfully' };
  }
}

module.exports = new AuthService();
