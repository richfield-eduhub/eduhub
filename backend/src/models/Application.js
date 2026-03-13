const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  referenceNumber: {
    type: DataTypes.STRING,
    unique: true,
  },

  // Personal Details
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  idNumber: { type: DataTypes.STRING, allowNull: false },
  dateOfBirth: { type: DataTypes.DATEONLY, allowNull: false },
  gender: { type: DataTypes.ENUM('male', 'female', 'other'), allowNull: false },
  nationality: { type: DataTypes.STRING, allowNull: false },

  // Contact Details
  phone: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, validate: { isEmail: true } },
  addressStreet: { type: DataTypes.STRING },
  addressCity: { type: DataTypes.STRING },
  addressProvince: { type: DataTypes.STRING },
  addressPostalCode: { type: DataTypes.STRING },

  // Educational Details
  highSchool: { type: DataTypes.STRING },
  matricYear: { type: DataTypes.INTEGER },
  matricSubjects: { type: DataTypes.JSONB }, // array of { subject, grade }

  // Tertiary Education
  previousTertiary: { type: DataTypes.JSONB }, // { institution, qualification, year }

  // Account Payer Details
  payerName: { type: DataTypes.STRING },
  payerRelation: { type: DataTypes.STRING },
  payerPhone: { type: DataTypes.STRING },
  payerEmail: { type: DataTypes.STRING },

  // Qualification Selection
  qualificationId: { type: DataTypes.INTEGER },
  qualificationName: { type: DataTypes.STRING },

  // Documents (stored as filenames or URLs)
  documents: { type: DataTypes.JSONB }, // { idCopy, matric, proofOfPayment, ... }

  // T&Cs
  termsAccepted: { type: DataTypes.BOOLEAN, defaultValue: false },

  // Status
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'declined'),
    defaultValue: 'pending',
  },
  declineReason: { type: DataTypes.TEXT },

  // Linked user (set when approved)
  userId: { type: DataTypes.INTEGER, allowNull: true },
});

module.exports = Application;
