const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * EmergencyContact Model
 *
 * Stores emergency contact information for students.
 * Each student can have multiple emergency contacts with one designated as primary.
 *
 * Design Reference: MISSING_FEATURES.md section 1.1
 */
const EmergencyContact = sequelize.define('EmergencyContact', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'student_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  relationship: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['Mother', 'Father', 'Guardian', 'Spouse', 'Sibling', 'Friend', 'Other']],
    },
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  alternatePhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'alternate_phone',
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_primary',
  },
}, {
  tableName: 'emergency_contacts',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = EmergencyContact;
