/**
 * Migration: Add Student Profile and Academic Tracking Columns
 *
 * Adds missing columns to the students table for better academic tracking.
 * This addresses the gap identified in MISSING_FEATURES.md section 1.2
 *
 * Design Specification: Page 23-24 of design-phase-final2.pdf
 *
 * New Columns:
 * - profile_photo_url: URL to student's profile photo
 * - expected_graduation: Expected graduation date
 * - graduation_date: Actual graduation date
 * - lifecycle_status: Overall student lifecycle status
 */

/** @type {{ migration: { name: string, up: Function } }} */
module.exports = {
  migration: {
    name: '2026-06-13-05-add-student-profile-columns',

    up: async (queryInterface, Sequelize, transaction) => {
      console.log('🔄 Adding profile and tracking columns to students table...');

      // Add profile_photo_url column
      await queryInterface.addColumn(
        'students',
        'profile_photo_url',
        {
          type: Sequelize.STRING(500),
          allowNull: true,
          comment: 'URL/path to student profile photo',
        },
        { transaction }
      );

      // Add expected_graduation column
      await queryInterface.addColumn(
        'students',
        'expected_graduation',
        {
          type: Sequelize.DATEONLY,
          allowNull: true,
          comment: 'Expected graduation date based on program duration',
        },
        { transaction }
      );

      // Add graduation_date column
      await queryInterface.addColumn(
        'students',
        'graduation_date',
        {
          type: Sequelize.DATEONLY,
          allowNull: true,
          comment: 'Actual graduation date (set when student completes program)',
        },
        { transaction }
      );

      // Add lifecycle_status column (broader than academic_status)
      await queryInterface.addColumn(
        'students',
        'lifecycle_status',
        {
          type: Sequelize.ENUM('applicant', 'enrolled', 'on_leave', 'alumni', 'withdrawn'),
          defaultValue: 'enrolled',
          allowNull: false,
          comment: 'Overall student lifecycle status',
        },
        { transaction }
      );

      // Add gpa column for cumulative GPA tracking
      await queryInterface.addColumn(
        'students',
        'cumulative_gpa',
        {
          type: Sequelize.DECIMAL(3, 2),
          allowNull: true,
          comment: 'Cumulative Grade Point Average (0.00 - 4.00)',
        },
        { transaction }
      );

      // Add total_credits_earned column
      await queryInterface.addColumn(
        'students',
        'total_credits_earned',
        {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: false,
          comment: 'Total credits earned across all semesters',
        },
        { transaction }
      );

      // Add indexes for better query performance
      await queryInterface.addIndex(
        'students',
        ['lifecycle_status'],
        {
          name: 'idx_students_lifecycle_status',
          transaction,
        }
      );

      await queryInterface.addIndex(
        'students',
        ['expected_graduation'],
        {
          name: 'idx_students_expected_graduation',
          transaction,
        }
      );

      await queryInterface.addIndex(
        'students',
        ['graduation_date'],
        {
          name: 'idx_students_graduation_date',
          transaction,
        }
      );

      console.log('✅ Added profile and tracking columns to students table');
    },
  },
};
