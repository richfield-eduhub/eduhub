const sequelize = require('../config/database');
const User = require('./User');
const Application = require('./Application');
const Qualification = require('./Qualification');
const Module = require('./Module');
const Semester = require('./Semester');
const Registration = require('./Registration');
const EmergencyContact = require('./EmergencyContact');
const ApplicationDocument = require('./ApplicationDocument');
const SystemSetting = require('./SystemSetting');

// Associations
Application.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Application, { foreignKey: 'userId', as: 'application' });

Module.belongsTo(Qualification, { foreignKey: 'qualificationId', as: 'qualification' });
Qualification.hasMany(Module, { foreignKey: 'qualificationId', as: 'modules' });

Registration.belongsTo(User, { foreignKey: 'userId', as: 'student' });
Registration.belongsTo(Semester, { foreignKey: 'semesterId', as: 'semester' });
User.hasMany(Registration, { foreignKey: 'userId', as: 'registrations' });

// Emergency Contacts Associations
EmergencyContact.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
User.hasMany(EmergencyContact, { foreignKey: 'studentId', as: 'emergencyContacts' });

// Application Documents Associations
ApplicationDocument.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });
Application.hasMany(ApplicationDocument, { foreignKey: 'applicationId', as: 'documents' });

ApplicationDocument.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });
ApplicationDocument.belongsTo(User, { foreignKey: 'verifiedBy', as: 'verifier' });

// System Settings Associations
SystemSetting.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

module.exports = {
  sequelize,
  User,
  Application,
  Qualification,
  Module,
  Semester,
  Registration,
  EmergencyContact,
  ApplicationDocument,
  SystemSetting
};
