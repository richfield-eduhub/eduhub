/**
 * Migration: Add Application Documents Table
 *
 * Ensures the application_documents table exists with the expected schema.
 * The base schema migration may already create this table with a subset of
 * columns; this migration upgrades or creates as needed.
 */

/** @type {{ migration: { name: string, up: Function } }} */
module.exports = {
  migration: {
    name: '2026-06-13-02-add-application-documents-table',

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

      if (!(await tableExists('application_documents'))) {
        console.log('🔄 Creating application_documents table...');
        await queryInterface.createTable(
          'application_documents',
          {
            id: {
              type: Sequelize.UUID,
              primaryKey: true,
              defaultValue: Sequelize.literal('uuid_generate_v4()'),
            },
            application_id: {
              type: Sequelize.UUID,
              allowNull: false,
              references: { model: 'applications', key: 'id' },
              onDelete: 'CASCADE',
              onUpdate: 'CASCADE',
            },
            document_type: {
              type: Sequelize.ENUM(
                'id_document',
                'matric_certificate',
                'tertiary_transcript',
                'proof_of_payment',
                'passport_photo',
                'study_permit',
                'saqa_evaluation',
                'other',
              ),
              allowNull: false,
            },
            file_name: { type: Sequelize.STRING(255), allowNull: false },
            file_path: { type: Sequelize.STRING(500), allowNull: false },
            file_size: { type: Sequelize.INTEGER, allowNull: true },
            mime_type: { type: Sequelize.STRING(100), allowNull: true },
            uploaded_by: {
              type: Sequelize.UUID,
              allowNull: true,
              references: { model: 'users', key: 'id' },
              onDelete: 'SET NULL',
              onUpdate: 'CASCADE',
            },
            is_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
            verified_by: {
              type: Sequelize.UUID,
              allowNull: true,
              references: { model: 'users', key: 'id' },
              onDelete: 'SET NULL',
            },
            verified_at: { type: Sequelize.DATE, allowNull: true },
            notes: { type: Sequelize.TEXT, allowNull: true },
            uploaded_at: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal('NOW()'),
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
      } else {
        console.log('🔄 Upgrading existing application_documents table...');

        const addColumnIfMissing = async (columnName, definition) => {
          if (!(await columnExists('application_documents', columnName))) {
            await queryInterface.addColumn(
              'application_documents',
              columnName,
              definition,
              { transaction },
            );
          }
        };

        await addColumnIfMissing('uploaded_by', {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'users', key: 'id' },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        });

        await addColumnIfMissing('notes', {
          type: Sequelize.TEXT,
          allowNull: true,
        });

        await addColumnIfMissing('created_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('NOW()'),
        });

        await addColumnIfMissing('updated_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('NOW()'),
        });
      }

      if (!(await indexExists('idx_application_documents_application_id'))) {
        await queryInterface.addIndex(
          'application_documents',
          ['application_id'],
          {
            name: 'idx_application_documents_application_id',
            transaction,
          },
        );
      }

      if (!(await indexExists('idx_application_documents_app_type'))) {
        await queryInterface.addIndex(
          'application_documents',
          ['application_id', 'document_type'],
          {
            name: 'idx_application_documents_app_type',
            transaction,
          },
        );
      }

      if (!(await indexExists('idx_application_documents_uploaded_by'))) {
        await queryInterface.addIndex(
          'application_documents',
          ['uploaded_by'],
          {
            name: 'idx_application_documents_uploaded_by',
            transaction,
          },
        );
      }

      if (!(await indexExists('idx_application_documents_is_verified'))) {
        await queryInterface.addIndex(
          'application_documents',
          ['is_verified'],
          {
            name: 'idx_application_documents_is_verified',
            transaction,
          },
        );
      }

      console.log('✅ application_documents table is ready');
    },
  },
};
