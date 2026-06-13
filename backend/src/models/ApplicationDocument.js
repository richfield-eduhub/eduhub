const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * ApplicationDocument Model
 *
 * Stores metadata about documents uploaded for student applications.
 * Actual files are stored on disk or cloud storage; this tracks metadata.
 *
 * Design Reference: MISSING_FEATURES.md section 1.1
 */
const ApplicationDocument = sequelize.define('ApplicationDocument', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  applicationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'application_id',
    references: {
      model: 'Applications',
      key: 'id',
    },
  },
  documentType: {
    type: DataTypes.ENUM('ID', 'Certificate', 'Transcript', 'Matric', 'ProofOfPayment', 'Other'),
    allowNull: false,
    field: 'document_type',
  },
  fileName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'file_name',
  },
  filePath: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'file_path',
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'file_size',
    validate: {
      max: 5242880, // 5MB in bytes
    },
  },
  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'mime_type',
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'uploaded_by',
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_verified',
  },
  verifiedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'verified_by',
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'verified_at',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  uploadedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'uploaded_at',
  },
}, {
  tableName: 'application_documents',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = ApplicationDocument;
