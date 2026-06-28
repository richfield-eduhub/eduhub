const { createMockSequelize } = require('../helpers/mockSequelize');

const mockSequelize = createMockSequelize();
jest.mock('../../src/config/database', () => mockSequelize);

const systemSettingsService = require('../../src/services/systemSettings.service');

describe('SystemSettingsService', () => {
  beforeEach(() => mockSequelize.reset());

  describe('validateSettingValue', () => {
    it('accepts valid integers', () => {
      expect(() => systemSettingsService.validateSettingValue('24', 'integer')).not.toThrow();
    });

    it('rejects non-integer values', () => {
      expect(() => systemSettingsService.validateSettingValue('abc', 'integer')).toThrow();
    });

    it('accepts boolean strings', () => {
      expect(() => systemSettingsService.validateSettingValue('true', 'boolean')).not.toThrow();
      expect(() => systemSettingsService.validateSettingValue('0', 'boolean')).not.toThrow();
    });

    it('rejects invalid booleans', () => {
      expect(() => systemSettingsService.validateSettingValue('maybe', 'boolean')).toThrow();
    });

    it('accepts valid dates', () => {
      expect(() => systemSettingsService.validateSettingValue('2026-06-28', 'date')).not.toThrow();
    });
  });

  it('returns all settings', async () => {
    const settings = [{ setting_key: 'max_credits_per_semester', setting_value: '24' }];
    mockSequelize.query.mockResolvedValueOnce(settings);

    const result = await systemSettingsService.getAllSettings();
    expect(result).toEqual(settings);
  });

  it('throws when setting is not found', async () => {
    mockSequelize.query.mockResolvedValueOnce([]);

    await expect(systemSettingsService.getSettingByKey('missing')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('rejects updates to non-editable settings', async () => {
    mockSequelize.query.mockResolvedValueOnce([{
      setting_key: 'system_version',
      is_editable: false,
      setting_type: 'string',
    }]);

    await expect(
      systemSettingsService.updateSetting('system_version', '2.0')
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('categorizes settings by key prefix', async () => {
    jest.spyOn(systemSettingsService, 'getAllSettings').mockResolvedValueOnce([
      { setting_key: 'registration_open', setting_value: 'true' },
      { setting_key: 'max_grade_points', setting_value: '100' },
      { setting_key: 'smtp_host', setting_value: 'smtp.test.com' },
      { setting_key: 'other_setting', setting_value: 'x' },
    ]);

    const categorized = await systemSettingsService.getSettingsByCategory();
    expect(categorized.registration).toHaveLength(1);
    expect(categorized.academic).toHaveLength(1);
    expect(categorized.email).toHaveLength(1);
    expect(categorized.other).toHaveLength(1);
    expect(categorized.registration[0].setting_key).toBe('registration_open');
    expect(categorized.academic[0].setting_key).toBe('max_grade_points');
  });
});
