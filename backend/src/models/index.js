const sequelize = require('../config/database');
const User = require('./User');
const Application = require('./Application');
const Qualification = require('./Qualification');
const Module = require('./Module');
const Semester = require('./Semester');
const Registration = require('./Registration');

// Associations
Application.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Application, { foreignKey: 'userId', as: 'application' });

Module.belongsTo(Qualification, { foreignKey: 'qualificationId', as: 'qualification' });
Qualification.hasMany(Module, { foreignKey: 'qualificationId', as: 'modules' });

Registration.belongsTo(User, { foreignKey: 'userId', as: 'student' });
Registration.belongsTo(Semester, { foreignKey: 'semesterId', as: 'semester' });
User.hasMany(Registration, { foreignKey: 'userId', as: 'registrations' });

module.exports = { sequelize, User, Application, Qualification, Module, Semester, Registration };
