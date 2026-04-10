const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // Auto-generated reference number: SD2025XXXXXXX / AM / LT
  studentNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'student', 'lecturer'),
    defaultValue: 'student',
  },
  isPasswordChanged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 10);
      if (!user.studentNumber) {
        user.studentNumber = generateStudentNumber(user.role);
      }
    },
  },
});

function generateStudentNumber(role) {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000000 + Math.random() * 9000000);
  const prefixes = { student: 'SD', admin: 'AM', lecturer: 'LT' };
  const prefix = prefixes[role] || 'SD';
  return `${prefix}${year}${rand}`;
}

User.prototype.validatePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = User;
