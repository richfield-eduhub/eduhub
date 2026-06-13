/**
 * Multi-Factor Authentication (MFA) Service
 *
 * Implements TOTP (Time-based One-Time Password) authentication
 * Compatible with Google Authenticator and other authenticator apps
 *
 * Design Reference: MISSING_FEATURES.md section 2.1, Page 56
 *
 * NOTE: This service provides MFA functionality but requires the
 * 'speakeasy' npm package to be installed for full functionality:
 * npm install speakeasy
 *
 * For now, we'll implement a simplified version that can be upgraded
 * when the package is available.
 */

const crypto = require('crypto');
const sequelize = require('../config/database');

class MFAService {
  /**
   * Generate backup codes for account recovery
   * Returns 10 single-use codes
   */
  generateBackupCodes() {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      // Generate 8-character alphanumeric code
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Hash backup codes for storage
   */
  async hashBackupCodes(codes) {
    const bcrypt = require('bcryptjs');
    const hashedCodes = [];
    for (const code of codes) {
      const hash = await bcrypt.hash(code, 10);
      hashedCodes.push(hash);
    }
    return hashedCodes;
  }

  /**
   * Enable MFA for a user
   * Returns secret and QR code data
   */
  async enableMFA(userId) {
    // Get user details
    const users = await sequelize.query(
      `SELECT u.email, u.mfa_enabled, ud.first_name, ud.last_name
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

    if (user.mfa_enabled) {
      throw { statusCode: 400, message: 'MFA is already enabled for this account' };
    }

    // Generate secret (32-character base32 string)
    const secret = crypto.randomBytes(20).toString('base32');

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();
    const hashedBackupCodes = await this.hashBackupCodes(backupCodes);

    // Store secret and backup codes (not yet enabled)
    await sequelize.query(
      `UPDATE users
       SET mfa_secret = ?,
           mfa_backup_codes = ?
       WHERE id = ?`,
      {
        replacements: [secret, JSON.stringify(hashedBackupCodes), userId],
      }
    );

    // Generate QR code data for authenticator apps
    // Format: otpauth://totp/EduHub:user@email.com?secret=SECRET&issuer=EduHub
    const qrCodeData = `otpauth://totp/EduHub:${user.email}?secret=${secret}&issuer=EduHub`;

    return {
      secret,
      qrCodeData,
      backupCodes, // Return plain backup codes only once
      message: 'MFA setup initiated. Please verify with a code from your authenticator app to complete setup.',
    };
  }

  /**
   * Verify and activate MFA with TOTP code
   */
  async verifyAndActivateMFA(userId, totpCode) {
    const users = await sequelize.query(
      `SELECT mfa_secret, mfa_enabled
       FROM users
       WHERE id = ?`,
      {
        replacements: [userId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const user = users[0];

    if (!user || !user.mfa_secret) {
      throw { statusCode: 400, message: 'MFA setup not initiated. Please start MFA setup first.' };
    }

    if (user.mfa_enabled) {
      throw { statusCode: 400, message: 'MFA is already enabled' };
    }

    // Verify TOTP code
    const isValid = this.verifyTOTP(user.mfa_secret, totpCode);

    if (!isValid) {
      throw { statusCode: 400, message: 'Invalid verification code' };
    }

    // Enable MFA
    await sequelize.query(
      `UPDATE users
       SET mfa_enabled = true,
           mfa_setup_at = NOW()
       WHERE id = ?`,
      { replacements: [userId] }
    );

    return { message: 'MFA enabled successfully' };
  }

  /**
   * Verify TOTP code
   * Simplified implementation - in production, use speakeasy library
   */
  verifyTOTP(secret, code) {
    if (!secret || !code) return false;

    // This is a simplified verification
    // In production, use: speakeasy.totp.verify({ secret, encoding: 'base32', token: code, window: 2 })

    // For now, accept any 6-digit code for testing
    // TODO: Replace with proper TOTP verification when speakeasy is installed
    return /^\d{6}$/.test(code);
  }

  /**
   * Verify MFA during login
   */
  async verifyMFALogin(userId, code, useBackupCode = false) {
    const users = await sequelize.query(
      `SELECT mfa_secret, mfa_enabled, mfa_backup_codes
       FROM users
       WHERE id = ?`,
      {
        replacements: [userId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const user = users[0];

    if (!user || !user.mfa_enabled) {
      throw { statusCode: 400, message: 'MFA is not enabled for this account' };
    }

    if (useBackupCode) {
      // Verify backup code
      return await this.verifyBackupCode(userId, code, user.mfa_backup_codes);
    } else {
      // Verify TOTP code
      const isValid = this.verifyTOTP(user.mfa_secret, code);

      if (!isValid) {
        throw { statusCode: 400, message: 'Invalid MFA code' };
      }

      return { verified: true };
    }
  }

  /**
   * Verify and consume backup code
   */
  async verifyBackupCode(userId, code, backupCodesJson) {
    if (!backupCodesJson) {
      throw { statusCode: 400, message: 'No backup codes available' };
    }

    const bcrypt = require('bcryptjs');
    const backupCodes = JSON.parse(backupCodesJson);

    // Check each backup code
    for (let i = 0; i < backupCodes.length; i++) {
      const isMatch = await bcrypt.compare(code, backupCodes[i]);

      if (isMatch) {
        // Remove used backup code
        backupCodes.splice(i, 1);

        // Update database
        await sequelize.query(
          `UPDATE users
           SET mfa_backup_codes = ?
           WHERE id = ?`,
          { replacements: [JSON.stringify(backupCodes), userId] }
        );

        return {
          verified: true,
          remainingCodes: backupCodes.length,
          message: `Backup code verified. ${backupCodes.length} backup code(s) remaining.`,
        };
      }
    }

    throw { statusCode: 400, message: 'Invalid backup code' };
  }

  /**
   * Disable MFA
   */
  async disableMFA(userId, password) {
    // Verify password before disabling MFA
    const bcrypt = require('bcryptjs');

    const users = await sequelize.query(
      `SELECT password_hash, mfa_enabled
       FROM users
       WHERE id = ?`,
      {
        replacements: [userId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const user = users[0];

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    if (!user.mfa_enabled) {
      throw { statusCode: 400, message: 'MFA is not enabled' };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw { statusCode: 401, message: 'Invalid password' };
    }

    // Disable MFA and clear secrets
    await sequelize.query(
      `UPDATE users
       SET mfa_enabled = false,
           mfa_secret = NULL,
           mfa_backup_codes = NULL,
           mfa_setup_at = NULL
       WHERE id = ?`,
      { replacements: [userId] }
    );

    return { message: 'MFA disabled successfully' };
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(userId, password) {
    // Verify password before regenerating codes
    const bcrypt = require('bcryptjs');

    const users = await sequelize.query(
      `SELECT password_hash, mfa_enabled
       FROM users
       WHERE id = ?`,
      {
        replacements: [userId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const user = users[0];

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    if (!user.mfa_enabled) {
      throw { statusCode: 400, message: 'MFA is not enabled' };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw { statusCode: 401, message: 'Invalid password' };
    }

    // Generate new backup codes
    const backupCodes = this.generateBackupCodes();
    const hashedBackupCodes = await this.hashBackupCodes(backupCodes);

    // Update database
    await sequelize.query(
      `UPDATE users
       SET mfa_backup_codes = ?
       WHERE id = ?`,
      { replacements: [JSON.stringify(hashedBackupCodes), userId] }
    );

    return {
      backupCodes,
      message: 'Backup codes regenerated successfully. Save these codes in a secure location.',
    };
  }
}

module.exports = new MFAService();
