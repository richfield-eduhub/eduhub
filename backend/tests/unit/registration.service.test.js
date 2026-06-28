const { createMockSequelize } = require('../helpers/mockSequelize');

const mockSequelize = createMockSequelize();
jest.mock('../../src/config/database', () => mockSequelize);

const registrationService = require('../../src/services/registration.service');

describe('RegistrationService', () => {
  beforeEach(() => mockSequelize.reset());

  it('returns satisfied when module has no prerequisites', async () => {
    mockSequelize.query.mockResolvedValueOnce([]);

    const result = await registrationService.checkPrerequisites(1, 10);
    expect(result.satisfied).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  it('flags missing prerequisites', async () => {
    mockSequelize.query
      .mockResolvedValueOnce([{
        prerequisite_module_id: 5,
        prerequisite_code: 'IT101',
        prerequisite_name: 'Intro to IT',
        minimum_grade: 'C',
      }])
      .mockResolvedValueOnce([]);

    const result = await registrationService.checkPrerequisites(1, 10);
    expect(result.satisfied).toBe(false);
    expect(result.missing[0].reason).toBe('Not completed');
  });

  it('detects no schedule conflict when module has no schedule', async () => {
    mockSequelize.query.mockResolvedValueOnce([]);

    const result = await registrationService.checkScheduleConflicts(1, 10, 1);
    expect(result.hasConflict).toBe(false);
  });

  it('calculates credit totals against maximum', async () => {
    mockSequelize.query
      .mockResolvedValueOnce([{ setting_value: '20' }])
      .mockResolvedValueOnce([{ credits: 6 }])
      .mockResolvedValueOnce([{ total_credits: 18 }]);

    const result = await registrationService.checkMaximumCredits(1, 10, 1);
    expect(result.exceedsMaximum).toBe(true);
    expect(result.maxCredits).toBe(20);
    expect(result.newTotal).toBe(24);
  });

  it('rejects invalid grades', async () => {
    await expect(
      registrationService.updateGrade(1, 'Z', 99)
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('prevents dropping completed registrations', async () => {
    mockSequelize.query.mockResolvedValueOnce([{ id: 1, status: 'completed' }]);

    await expect(
      registrationService.dropRegistration(1, 5)
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Cannot drop a completed registration',
    });
  });
});
