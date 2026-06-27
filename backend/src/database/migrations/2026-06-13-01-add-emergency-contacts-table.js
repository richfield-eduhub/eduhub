/**
 * Migration: Add Emergency Contacts Table
 *
 * Ensures the emergency_contacts table exists with the expected schema.
 * The base schema migration may already create this table with legacy column
 * names (user_id, alt_phone); this migration upgrades or creates as needed.
 */

/** @type {{ migration: { name: string, up: Function } }} */
module.exports = {
  migration: {
    name: '2026-06-13-01-add-emergency-contacts-table',

    up: async (queryInterface, Sequelize, transaction) => {
      const sequelize = queryInterface.sequelize;

      const tableExists = async (tableName) => {
        const [rows] = await sequelize.query(
          'SELECT to_regclass(:tableName) AS exists_name',
          { replacements: { tableName: `public.${tableName}` }, transaction },
        );
        return Boolean(rows?.[0]?.exists_name);
      };

      const columnExists = async (tableName, columnName) => {
        const [rows] = await sequelize.query(
          `SELECT 1
           FROM information_schema.columns
           WHERE table_schema = 'public'
             AND table_name = :tableName
             AND column_name = :columnName`,
          { replacements: { tableName, columnName }, transaction },
        );
        return rows.length > 0;
      };

      const indexExists = async (indexName) => {
        const [rows] = await sequelize.query(
          'SELECT 1 FROM pg_indexes WHERE indexname = :indexName',
          { replacements: { indexName }, transaction },
        );
        return rows.length > 0;
      };

      const emergencyContactsColumns = {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.literal('uuid_generate_v4()'),
        },
        student_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        relationship: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        phone: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        alternate_phone: {
          type: Sequelize.STRING(20),
          allowNull: true,
        },
        email: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        address: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        is_primary: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
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
      };

      if (!(await tableExists('emergency_contacts'))) {
        console.log('🔄 Creating emergency_contacts table...');
        await queryInterface.createTable(
          'emergency_contacts',
          emergencyContactsColumns,
          { transaction },
        );
      } else {
        console.log('🔄 Upgrading existing emergency_contacts table...');

        if (
          (await columnExists('emergency_contacts', 'user_id')) &&
          !(await columnExists('emergency_contacts', 'student_id'))
        ) {
          await queryInterface.renameColumn(
            'emergency_contacts',
            'user_id',
            'student_id',
            { transaction },
          );
        }

        if (
          (await columnExists('emergency_contacts', 'alt_phone')) &&
          !(await columnExists('emergency_contacts', 'alternate_phone'))
        ) {
          await queryInterface.renameColumn(
            'emergency_contacts',
            'alt_phone',
            'alternate_phone',
            { transaction },
          );
        }

        if (!(await columnExists('emergency_contacts', 'alternate_phone'))) {
          await queryInterface.addColumn(
            'emergency_contacts',
            'alternate_phone',
            { type: Sequelize.STRING(20), allowNull: true },
            { transaction },
          );
        }

        if (!(await columnExists('emergency_contacts', 'address'))) {
          await queryInterface.addColumn(
            'emergency_contacts',
            'address',
            { type: Sequelize.STRING(500), allowNull: true },
            { transaction },
          );
        }
      }

      if (!(await indexExists('idx_emergency_contacts_student_id'))) {
        await queryInterface.addIndex(
          'emergency_contacts',
          ['student_id'],
          {
            name: 'idx_emergency_contacts_student_id',
            transaction,
          },
        );
      }

      if (!(await indexExists('idx_emergency_contacts_student_primary'))) {
        await queryInterface.addIndex(
          'emergency_contacts',
          ['student_id', 'is_primary'],
          {
            name: 'idx_emergency_contacts_student_primary',
            transaction,
          },
        );
      }

      console.log('✅ emergency_contacts table is ready');
    },
  },
};
