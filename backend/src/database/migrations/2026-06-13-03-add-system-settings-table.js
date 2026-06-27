/**
 * Migration: Add System Settings Table
 *
 * Creates the system_settings table for centralized configuration management.
 * This addresses the gap identified in MISSING_FEATURES.md section 1.1
 *
 * Design Specification: Page 29 of design-phase-final2.pdf
 *
 * Key Settings:
 * - registration_start_date
 * - registration_end_date
 * - add_drop_deadline
 * - current_semester
 * - max_credits_per_semester
 */

/** @type {{ migration: { name: string, up: Function } }} */
module.exports = {
  migration: {
    name: '2026-06-13-03-add-system-settings-table',

    up: async (queryInterface, Sequelize, transaction) => {
      const sequelize = queryInterface.sequelize;

      const tableExists = async (tableName) => {
        const [rows] = await sequelize.query(
          'SELECT to_regclass(:tableName) AS exists_name',
          { replacements: { tableName: `public.${tableName}` }, transaction },
        );
        return Boolean(rows?.[0]?.exists_name);
      };

      const indexExists = async (indexName) => {
        const [rows] = await sequelize.query(
          'SELECT 1 FROM pg_indexes WHERE indexname = :indexName',
          { replacements: { indexName }, transaction },
        );
        return rows.length > 0;
      };

      if (await tableExists('system_settings')) {
        console.log('✅ system_settings table already exists — skipping create');
        return;
      }

      console.log('🔄 Creating system_settings table...');

      await queryInterface.createTable(
        'system_settings',
        {
          id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.literal('uuid_generate_v4()'),
            comment: 'Primary key for setting',
          },
          setting_key: {
            type: Sequelize.STRING(100),
            allowNull: false,
            unique: true,
            comment: 'Unique identifier for the setting (e.g., max_credits_per_semester)',
          },
          setting_value: {
            type: Sequelize.TEXT,
            allowNull: false,
            comment: 'Value of the setting (stored as string, parse as needed)',
          },
          setting_type: {
            type: Sequelize.ENUM('string', 'number', 'boolean', 'date', 'json'),
            defaultValue: 'string',
            comment: 'Data type hint for parsing the value',
          },
          description: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Human-readable description of what this setting controls',
          },
          category: {
            type: Sequelize.STRING(50),
            allowNull: true,
            comment: 'Category for grouping settings (e.g., academic, system, security)',
          },
          is_public: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            comment: 'Whether this setting can be viewed by non-admin users',
          },
          updated_by: {
            type: Sequelize.UUID,
            allowNull: true,
            references: { model: 'users', key: 'id' },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
            comment: 'User who last updated this setting',
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

      // Add indexes
      if (!(await indexExists('idx_system_settings_key'))) {
        await queryInterface.addIndex(
          'system_settings',
          ['setting_key'],
          {
            name: 'idx_system_settings_key',
            unique: true,
            transaction,
          },
        );
      }

      if (!(await indexExists('idx_system_settings_category'))) {
        await queryInterface.addIndex(
          'system_settings',
          ['category'],
          {
            name: 'idx_system_settings_category',
            transaction,
          },
        );
      }

      if (!(await indexExists('idx_system_settings_is_public'))) {
        await queryInterface.addIndex(
          'system_settings',
          ['is_public'],
          {
            name: 'idx_system_settings_is_public',
            transaction,
          },
        );
      }

      console.log('✅ Created system_settings table');

      // Insert default settings
      console.log('🔄 Inserting default system settings...');

      const defaultSettings = [
        {
          setting_key: 'max_credits_per_semester',
          setting_value: '18',
          setting_type: 'number',
          description: 'Maximum number of credits a student can register for per semester',
          category: 'academic',
          is_public: true,
        },
        {
          setting_key: 'registration_start_date',
          setting_value: '2026-07-01',
          setting_type: 'date',
          description: 'Start date for course registration',
          category: 'academic',
          is_public: true,
        },
        {
          setting_key: 'registration_end_date',
          setting_value: '2026-07-31',
          setting_type: 'date',
          description: 'End date for course registration',
          category: 'academic',
          is_public: true,
        },
        {
          setting_key: 'add_drop_deadline',
          setting_value: '2026-08-15',
          setting_type: 'date',
          description: 'Last date to add or drop courses without penalty',
          category: 'academic',
          is_public: true,
        },
        {
          setting_key: 'current_semester',
          setting_value: '2026-S2',
          setting_type: 'string',
          description: 'Current active semester',
          category: 'academic',
          is_public: true,
        },
        {
          setting_key: 'application_fee',
          setting_value: '500.00',
          setting_type: 'number',
          description: 'Application fee amount in ZAR',
          category: 'financial',
          is_public: true,
        },
        {
          setting_key: 'min_password_length',
          setting_value: '8',
          setting_type: 'number',
          description: 'Minimum password length requirement',
          category: 'security',
          is_public: true,
        },
        {
          setting_key: 'max_login_attempts',
          setting_value: '5',
          setting_type: 'number',
          description: 'Maximum failed login attempts before account lockout',
          category: 'security',
          is_public: false,
        },
        {
          setting_key: 'session_timeout_minutes',
          setting_value: '30',
          setting_type: 'number',
          description: 'Session timeout in minutes',
          category: 'security',
          is_public: false,
        },
        {
          setting_key: 'system_maintenance_mode',
          setting_value: 'false',
          setting_type: 'boolean',
          description: 'Enable maintenance mode to prevent user access',
          category: 'system',
          is_public: true,
        },
      ];

      for (const setting of defaultSettings) {
        await queryInterface.bulkInsert(
          'system_settings',
          [
            {
              ...setting,
              id: Sequelize.literal('uuid_generate_v4()'),
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
          { transaction }
        );
      }

      console.log('✅ Inserted default system settings');
    },
  },
};
