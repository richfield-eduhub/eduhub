const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * SystemSetting Model
 *
 * Stores system-wide configuration settings.
 * Settings can be of different types (string, number, boolean, date, json)
 * and are categorized for better organization.
 *
 * Design Reference: MISSING_FEATURES.md section 1.1
 */
const SystemSetting = sequelize.define('SystemSetting', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  settingKey: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'setting_key',
  },
  settingValue: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'setting_value',
  },
  settingType: {
    type: DataTypes.ENUM('string', 'number', 'boolean', 'date', 'json'),
    defaultValue: 'string',
    field: 'setting_type',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      isIn: [['academic', 'financial', 'security', 'system', 'notification', 'other']],
    },
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_public',
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'updated_by',
    references: {
      model: 'Users',
      key: 'id',
    },
  },
}, {
  tableName: 'system_settings',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

/**
 * Helper method to get a typed value
 * Parses the string value according to the setting type
 */
SystemSetting.prototype.getTypedValue = function() {
  switch (this.settingType) {
    case 'number':
      return parseFloat(this.settingValue);
    case 'boolean':
      return this.settingValue === 'true';
    case 'date':
      return new Date(this.settingValue);
    case 'json':
      return JSON.parse(this.settingValue);
    case 'string':
    default:
      return this.settingValue;
  }
};

/**
 * Helper method to set a typed value
 * Converts the value to a string for storage
 */
SystemSetting.prototype.setTypedValue = function(value) {
  switch (this.settingType) {
    case 'json':
      this.settingValue = JSON.stringify(value);
      break;
    case 'date':
      this.settingValue = value instanceof Date ? value.toISOString() : value;
      break;
    default:
      this.settingValue = String(value);
  }
};

module.exports = SystemSetting;
