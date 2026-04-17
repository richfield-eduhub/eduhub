/** @type {{ migration: { name: string, up: Function } }} */
module.exports = {
  migration: {
    name: '20260323-add-audit-logs-table',

    up: async (queryInterface, Sequelize, transaction) => {
      // Create audit_logs table to track important database events
      await queryInterface.createTable(
        'AuditLogs',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          tableName: {
            type: Sequelize.STRING(100),
            allowNull: false,
            comment: 'Name of the table being audited',
          },
          action: {
            type: Sequelize.ENUM('INSERT', 'UPDATE', 'DELETE'),
            allowNull: false,
            comment: 'Type of database action',
          },
          recordId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'ID of the record that was modified',
          },
          userId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: 'Users', key: 'id' },
            onDelete: 'SET NULL',
            comment: 'User who performed the action',
          },
          oldData: {
            type: Sequelize.JSONB,
            allowNull: true,
            comment: 'Previous state of the record (for UPDATE and DELETE)',
          },
          newData: {
            type: Sequelize.JSONB,
            allowNull: true,
            comment: 'New state of the record (for INSERT and UPDATE)',
          },
          ipAddress: {
            type: Sequelize.STRING(45),
            allowNull: true,
            comment: 'IP address of the client',
          },
          userAgent: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Browser/client user agent',
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('NOW()'),
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('NOW()'),
          },
        },
        { transaction }
      );

      // Add indexes for better query performance
      await queryInterface.addIndex(
        'AuditLogs',
        ['tableName'],
        {
          name: 'audit_logs_table_name_idx',
          transaction,
        }
      );

      await queryInterface.addIndex(
        'AuditLogs',
        ['userId'],
        {
          name: 'audit_logs_user_id_idx',
          transaction,
        }
      );

      await queryInterface.addIndex(
        'AuditLogs',
        ['createdAt'],
        {
          name: 'audit_logs_created_at_idx',
          transaction,
        }
      );

      // Composite index for common queries
      await queryInterface.addIndex(
        'AuditLogs',
        ['tableName', 'action', 'createdAt'],
        {
          name: 'audit_logs_table_action_date_idx',
          transaction,
        }
      );
    },
  },
};
