/**
 * Migration: Ensure notifications table has expected columns
 */

/** @type {{ migration: { name: string, up: Function } }} */
module.exports = {
  migration: {
    name: '2026-06-19-02-add-notifications-table',

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

      if (!(await tableExists('notifications'))) {
        await queryInterface.createTable(
          'notifications',
          {
            id: {
              type: Sequelize.UUID,
              primaryKey: true,
              defaultValue: Sequelize.literal('uuid_generate_v4()'),
            },
            user_id: {
              type: Sequelize.UUID,
              allowNull: false,
              references: { model: 'users', key: 'id' },
              onDelete: 'CASCADE',
            },
            title: { type: Sequelize.STRING(255), allowNull: false },
            message: { type: Sequelize.TEXT, allowNull: false },
            type: {
              type: Sequelize.ENUM('info', 'success', 'warning', 'error'),
              defaultValue: 'info',
            },
            is_read: { type: Sequelize.BOOLEAN, defaultValue: false },
            read_at: { type: Sequelize.DATE, allowNull: true },
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
          { transaction },
        );
      } else {
        if (!(await columnExists('notifications', 'read_at'))) {
          await queryInterface.addColumn(
            'notifications',
            'read_at',
            { type: Sequelize.DATE, allowNull: true },
            { transaction },
          );
        }

        if (!(await columnExists('notifications', 'updated_at'))) {
          await queryInterface.addColumn(
            'notifications',
            'updated_at',
            {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal('NOW()'),
            },
            { transaction },
          );
        }
      }

      const indexes = [
        { fields: ['user_id'], name: 'idx_notifications_user_id' },
        { fields: ['is_read'], name: 'idx_notifications_is_read' },
        { fields: ['created_at'], name: 'idx_notifications_created_at' },
      ];

      for (const index of indexes) {
        if (!(await indexExists(index.name))) {
          await queryInterface.addIndex('notifications', index.fields, {
            name: index.name,
            transaction,
          });
        }
      }

      console.log('✅ Notifications table is ready');
    },
  },
};
