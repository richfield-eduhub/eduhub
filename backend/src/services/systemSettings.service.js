/**
 * System Settings Service
 *
 * Handles system configuration management
 * Admins can view and update system settings
 */

const sequelize = require('../config/database');

class SystemSettingsService {
  /**
   * Get all system settings
   */
  async getAllSettings() {
    const settings = await sequelize.query(
      `SELECT
         setting_key,
         setting_value,
         setting_type,
         description,
         is_editable,
         updated_at
       FROM system_settings
       ORDER BY setting_key ASC`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return settings;
  }

  /**
   * Get a single setting by key
   */
  async getSettingByKey(settingKey) {
    const [setting] = await sequelize.query(
      `SELECT
         setting_key,
         setting_value,
         setting_type,
         description,
         is_editable,
         updated_at
       FROM system_settings
       WHERE setting_key = ?`,
      {
        replacements: [settingKey],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!setting) {
      throw { statusCode: 404, message: 'Setting not found' };
    }

    return setting;
  }

  /**
   * Update a setting value
   */
  async updateSetting(settingKey, settingValue) {
    // Check if setting exists and is editable
    const [setting] = await sequelize.query(
      `SELECT setting_key, is_editable, setting_type
       FROM system_settings
       WHERE setting_key = ?`,
      {
        replacements: [settingKey],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!setting) {
      throw { statusCode: 404, message: 'Setting not found' };
    }

    if (!setting.is_editable) {
      throw { statusCode: 403, message: 'This setting is not editable' };
    }

    // Validate value based on type
    this.validateSettingValue(settingValue, setting.setting_type);

    await sequelize.query(
      `UPDATE system_settings
       SET setting_value = ?,
           updated_at = NOW()
       WHERE setting_key = ?`,
      {
        replacements: [String(settingValue), settingKey],
      }
    );

    return await this.getSettingByKey(settingKey);
  }

  /**
   * Validate setting value based on type
   */
  validateSettingValue(value, type) {
    switch (type) {
      case 'integer':
        if (isNaN(parseInt(value))) {
          throw { statusCode: 400, message: 'Value must be an integer' };
        }
        break;
      case 'boolean':
        if (!['true', 'false', '0', '1'].includes(String(value).toLowerCase())) {
          throw { statusCode: 400, message: 'Value must be a boolean (true/false)' };
        }
        break;
      case 'date':
        if (isNaN(Date.parse(value))) {
          throw { statusCode: 400, message: 'Value must be a valid date' };
        }
        break;
      case 'string':
        // Any string is valid
        break;
      default:
        // Unknown type, allow any value
        break;
    }
  }

  /**
   * Get settings grouped by category
   */
  async getSettingsByCategory() {
    const settings = await this.getAllSettings();

    const categorized = {
      registration: [],
      academic: [],
      system: [],
      email: [],
      other: [],
    };

    settings.forEach(setting => {
      if (setting.setting_key.includes('registration') || setting.setting_key.includes('semester')) {
        categorized.registration.push(setting);
      } else if (setting.setting_key.includes('credit') || setting.setting_key.includes('grade')) {
        categorized.academic.push(setting);
      } else if (setting.setting_key.includes('email') || setting.setting_key.includes('smtp')) {
        categorized.email.push(setting);
      } else if (setting.setting_key.includes('maintenance') || setting.setting_key.includes('system')) {
        categorized.system.push(setting);
      } else {
        categorized.other.push(setting);
      }
    });

    return categorized;
  }

  /**
   * Bulk update multiple settings
   */
  async bulkUpdateSettings(updates) {
    if (!Array.isArray(updates) || updates.length === 0) {
      throw { statusCode: 400, message: 'Updates must be a non-empty array' };
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { setting_key, setting_value } = update;
        const result = await this.updateSetting(setting_key, setting_value);
        results.push(result);
      } catch (error) {
        errors.push({
          setting_key: update.setting_key,
          error: error.message,
        });
      }
    }

    return {
      updated: results,
      failed: errors,
    };
  }
}

module.exports = new SystemSettingsService();
