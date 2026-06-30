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

  it('detects overlapping schedule conflicts', async () => {
    mockSequelize.query
      .mockResolvedValueOnce([{ day_of_week: 'Monday', start_time: '09:00', end_time: '11:00' }])
      .mockResolvedValueOnce([{
        module_id: 2,
        module_code: 'IT102',
        module_name: 'Data Structures',
        day_of_week: 'Monday',
        start_time: '10:00',
        end_time: '12:00',
      }]);

    const result = await registrationService.checkScheduleConflicts(1, 10, 1);

    expect(result.hasConflict).toBe(true);
    expect(result.conflicts[0].module_code).toBe('IT102');
  });

  it('accepts prerequisites when grade meets minimum', async () => {
    mockSequelize.query
      .mockResolvedValueOnce([{
        prerequisite_module_id: 5,
        prerequisite_code: 'IT101',
        prerequisite_name: 'Intro to IT',
        minimum_grade: 'C',
      }])
      .mockResolvedValueOnce([{ grade: 'B', status: 'completed' }]);

    const result = await registrationService.checkPrerequisites(1, 10);
    expect(result.satisfied).toBe(true);
  });

  it('rejects registration when module is not found for credit check', async () => {
    mockSequelize.query
      .mockResolvedValueOnce([{ setting_value: '24' }])
      .mockResolvedValueOnce([]);

    await expect(
      registrationService.checkMaximumCredits(1, 10, 1)
    ).rejects.toMatchObject({ statusCode: 404, message: 'Module not found' });
  });

  it('rejects duplicate module registration', async () => {
    mockSequelize.query.mockResolvedValueOnce([{ id: 99, status: 'registered' }]);

    await expect(
      registrationService.registerForModule(1, 10, 1)
    ).rejects.toMatchObject({
      statusCode: 409,
      message: 'Already registered for this module with status: registered',
    });

    expect(mockSequelize.mockTransaction.rollback).toHaveBeenCalled();
  });

  it('drops an active registration', async () => {
    mockSequelize.query
      .mockResolvedValueOnce([{ id: 7, status: 'registered' }])
      .mockResolvedValueOnce(undefined);

    const result = await registrationService.dropRegistration(7, 1);

    expect(result.success).toBe(true);
  });

  it('returns registration details by id', async () => {
    mockSequelize.query.mockResolvedValueOnce([{
      id: 12,
      module_code: 'IT101',
      semester_name: 'Semester 1',
    }]);

    const registration = await registrationService.getRegistrationById(12);
    expect(registration.module_code).toBe('IT101');
  });

  it('updates grade and marks registration completed for passing grades', async () => {
    mockSequelize.query
      .mockResolvedValueOnce([{ id: 15, status: 'registered' }])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([{ credits: 15 }])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([{ id: 15, grade: 'B', status: 'completed' }]);

    const result = await registrationService.updateGrade(15, 'B', 99);

    expect(result.grade).toBe('B');
    expect(mockSequelize.mockTransaction.commit).toHaveBeenCalled();
  });
});
