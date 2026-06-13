/**
 * Migration: Add Application Documents Table
 *
 * Creates the application_documents table to store metadata about uploaded documents
 * for student applications (ID copies, certificates, transcripts, etc.).
 * This addresses the gap identified in MISSING_FEATURES.md section 1.1
 *
 * Design Specification: Page 26-27 of design-phase-final2.pdf
 */

/** @type {{ migration: { name: string, up: Function } }} */
module.exports = {
  migration: {
    name: '2026-06-13-02-add-application-documents-table',

    up: async (queryInterface, Sequelize, transaction) => {
      console.log('🔄 Creating application_documents table...');

      // First, check if Applications table exists (it should be in the main schema)
      await queryInterface.createTable(
        'application_documents',
        {
          id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.literal('uuid_generate_v4()'),
            comment: 'Primary key for document',
          },
          application_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'Applications', key: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            comment: 'Reference to the application this document belongs to',
          },
          document_type: {
            type: Sequelize.ENUM('ID', 'Certificate', 'Transcript', 'Matric', 'ProofOfPayment', 'Other'),
            allowNull: false,
            comment: 'Type of document being uploaded',
          },
          file_name: {
            type: Sequelize.STRING(255),
            allowNull: false,
            comment: 'Original filename',
          },
          file_path: {
            type: Sequelize.STRING(500),
            allowNull: false,
            comment: 'Storage path on server or cloud storage URL',
          },
          file_size: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
              max: 5242880, // 5MB in bytes
            },
            comment: 'File size in bytes (max 5MB)',
          },
          mime_type: {
            type: Sequelize.STRING(100),
            allowNull: false,
            comment: 'MIME type (e.g., application/pdf, image/jpeg)',
          },
          uploaded_by: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: 'Users', key: 'id' },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
            comment: 'User who uploaded the document (applicant or admin)',
          },
          is_verified: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            comment: 'Whether document has been verified by admin',
          },
          verified_by: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: 'Users', key: 'id' },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
            comment: 'Admin who verified the document',
          },
          verified_at: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'When the document was verified',
          },
          notes: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Admin notes about the document',
          },
          uploaded_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('NOW()'),
            comment: 'When the document was uploaded',
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
        'application_documents',
        ['application_id'],
        {
          name: 'idx_application_documents_application_id',
          transaction,
        }
      );

      await queryInterface.addIndex(
        'application_documents',
        ['application_id', 'document_type'],
        {
          name: 'idx_application_documents_app_type',
          transaction,
        }
      );

      await queryInterface.addIndex(
        'application_documents',
        ['uploaded_by'],
        {
          name: 'idx_application_documents_uploaded_by',
          transaction,
        }
      );

      await queryInterface.addIndex(
        'application_documents',
        ['is_verified'],
        {
          name: 'idx_application_documents_is_verified',
          transaction,
        }
      );

      console.log('✅ Created application_documents table');
    },
  },
};
