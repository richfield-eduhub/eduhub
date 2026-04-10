const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Registration = sequelize.define('Registration', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  semesterId: { type: DataTypes.INTEGER, allowNull: false },
  modules: { type: DataTypes.JSONB, allowNull: false }, // array of module IDs
  quotationAmount: { type: DataTypes.DECIMAL(10, 2) },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'declined'),
    defaultValue: 'pending',
  },
  declineReason: { type: DataTypes.TEXT },
});

module.exports = Registration;
