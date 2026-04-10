const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Semester = sequelize.define('Semester', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: { type: DataTypes.STRING, allowNull: false }, // e.g. "2025 Semester 1"
  year: { type: DataTypes.INTEGER, allowNull: false },
  semesterNumber: { type: DataTypes.INTEGER, allowNull: false }, // 1 or 2
  startDate: { type: DataTypes.DATEONLY },
  endDate: { type: DataTypes.DATEONLY },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: false },
  registrationOpen: { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = Semester;
