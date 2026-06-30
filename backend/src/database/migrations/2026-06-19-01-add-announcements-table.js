/**
 * Migration: Add announcements table
 */

/** @type {{ migration: { name: string, up: Function } }} */
module.exports = {
  migration: {
    name: '2026-06-19-01-add-announcements-table',

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

      if (!(await tableExists('announcements'))) {
        await queryInterface.createTable(
          'announcements',
          {
            id: {
              type: Sequelize.UUID,
              primaryKey: true,
              defaultValue: Sequelize.literal('uuid_generate_v4()'),
            },
            module_id: {
              type: Sequelize.UUID,
              allowNull: false,
              references: { model: 'modules', key: 'id' },
              onDelete: 'CASCADE',
            },
            created_by: {
              type: Sequelize.UUID,
              allowNull: false,
              references: { model: 'users', key: 'id' },
              onDelete: 'CASCADE',
            },
            title: { type: Sequelize.STRING(255), allowNull: false },
            content: { type: Sequelize.TEXT, allowNull: false },
            priority: {
              type: Sequelize.ENUM('low', 'normal', 'high', 'urgent'),
              defaultValue: 'normal',
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
          { transaction },
        );
      }

      const indexes = [
        { fields: ['module_id'], name: 'idx_announcements_module_id' },
        { fields: ['created_by'], name: 'idx_announcements_created_by' },
        { fields: ['priority'], name: 'idx_announcements_priority' },
        { fields: ['created_at'], name: 'idx_announcements_created_at' },
      ];

      for (const index of indexes) {
        if (!(await indexExists(index.name))) {
          await queryInterface.addIndex('announcements', index.fields, {
            name: index.name,
            transaction,
          });
        }
      }

      console.log('✅ Announcements table is ready');
    },
  },
};
