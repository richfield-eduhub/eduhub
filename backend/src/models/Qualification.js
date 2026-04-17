const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Qualification = sequelize.define('Qualification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code: { type: DataTypes.STRING, unique: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  faculty: { type: DataTypes.STRING },
  durationYears: { type: DataTypes.INTEGER },
  totalFee: { type: DataTypes.DECIMAL(10, 2) },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});

module.exports = Qualification;
