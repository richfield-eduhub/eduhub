/**
 * Migration: Add Emergency Contacts Table
 *
 * Creates the emergency_contacts table to store student emergency contact information.
 * This addresses the gap identified in MISSING_FEATURES.md section 1.1
 *
 * Design Specification: Page 25 of design-phase-final2.pdf
 */

/** @type {{ migration: { name: string, up: Function } }} */
module.exports = {
  migration: {
    name: '2026-06-13-01-add-emergency-contacts-table',

    up: async (queryInterface, Sequelize, transaction) => {
      console.log('🔄 Creating emergency_contacts table...');

      await queryInterface.createTable(
        'emergency_contacts',
        {
          id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.literal('uuid_generate_v4()'),
            comment: 'Primary key for emergency contact',
          },
          student_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: 'users', key: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            comment: 'Reference to the student (user) this contact belongs to',
          },
          name: {
            type: Sequelize.STRING(100),
            allowNull: false,
            comment: 'Full name of emergency contact',
          },
          relationship: {
            type: Sequelize.STRING(50),
            allowNull: false,
            comment: 'Relationship to student (e.g., Mother, Father, Guardian, Spouse)',
          },
          phone: {
            type: Sequelize.STRING(20),
            allowNull: false,
            comment: 'Primary phone number',
          },
          alternate_phone: {
            type: Sequelize.STRING(20),
            allowNull: true,
            comment: 'Alternate/secondary phone number',
          },
          email: {
            type: Sequelize.STRING(255),
            allowNull: true,
            validate: {
              isEmail: true,
            },
            comment: 'Email address of emergency contact',
          },
          is_primary: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            comment: 'Whether this is the primary emergency contact',
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('NOW()'),
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('NOW()'),
          },
        },
        { transaction }
      );

      // Add indexes for better query performance
      await queryInterface.addIndex(
        'emergency_contacts',
        ['student_id'],
        {
          name: 'idx_emergency_contacts_student_id',
          transaction,
        }
      );

      await queryInterface.addIndex(
        'emergency_contacts',
        ['student_id', 'is_primary'],
        {
          name: 'idx_emergency_contacts_student_primary',
          transaction,
        }
      );

      console.log('✅ Created emergency_contacts table');
    },
  },
};
