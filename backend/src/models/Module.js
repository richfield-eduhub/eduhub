const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Module = sequelize.define('Module', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code: { type: DataTypes.STRING, unique: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  credits: { type: DataTypes.INTEGER },
  year: { type: DataTypes.INTEGER }, // 1st year, 2nd year, etc.
  semester: { type: DataTypes.INTEGER }, // 1 or 2
  qualificationId: { type: DataTypes.INTEGER, allowNull: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});

module.exports = Module;
