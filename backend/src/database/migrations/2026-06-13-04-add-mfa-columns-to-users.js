/**
 * Migration: Add MFA Columns to Users Table
 *
 * Adds Multi-Factor Authentication (MFA) columns to the users table.
 * This addresses the gap identified in MISSING_FEATURES.md section 1.2
 *
 * Design Specification: Page 22-23, 56 of design-phase-final2.pdf
 *
 * New Columns:
 * - mfa_enabled: Boolean flag to enable/disable MFA
 * - mfa_secret: Encrypted secret key for TOTP generation
 * - mfa_backup_codes: JSON array of backup codes for account recovery
 */

/** @type {{ migration: { name: string, up: Function } }} */
module.exports = {
  migration: {
    name: '2026-06-13-04-add-mfa-columns-to-users',

    up: async (queryInterface, Sequelize, transaction) => {
      console.log('🔄 Adding MFA columns to users table...');

      // Add mfa_enabled column
      await queryInterface.addColumn(
        'users',
        'mfa_enabled',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
          comment: 'Whether MFA is enabled for this user',
        },
        { transaction }
      );

      // Add mfa_secret column (encrypted TOTP secret)
      await queryInterface.addColumn(
        'users',
        'mfa_secret',
        {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: 'Encrypted TOTP secret for MFA (base32 encoded)',
        },
        { transaction }
      );

      // Add mfa_backup_codes column (array of one-time use backup codes)
      await queryInterface.addColumn(
        'users',
        'mfa_backup_codes',
        {
          type: Sequelize.JSONB,
          allowNull: true,
          comment: 'Array of encrypted backup codes for MFA recovery (10 single-use codes)',
        },
        { transaction }
      );

      // Add mfa_setup_at column
      await queryInterface.addColumn(
        'users',
        'mfa_setup_at',
        {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'When MFA was first set up',
        },
        { transaction }
      );

      // Add index for MFA-enabled users
      await queryInterface.addIndex(
        'users',
        ['mfa_enabled'],
        {
          name: 'idx_users_mfa_enabled',
          transaction,
        }
      );

      console.log('✅ Added MFA columns to users table');
    },
  },
};
