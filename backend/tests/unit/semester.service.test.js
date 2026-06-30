const { createMockSequelize } = require('../helpers/mockSequelize');

const mockSequelize = createMockSequelize();
jest.mock('../../src/config/database', () => mockSequelize);

const semesterService = require('../../src/services/semester.service');

describe('SemesterService', () => {
  beforeEach(() => mockSequelize.reset());

  it('lists semesters ordered by year and number', async () => {
    const rows = [
      { id: 1, name: 'Semester 1 2026', year: 2026, semester_number: 1, is_active: true },
    ];
    mockSequelize.query.mockResolvedValueOnce(rows);

    const result = await semesterService.listSemesters();

    expect(result).toEqual(rows);
    expect(mockSequelize.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM semesters'),
      expect.objectContaining({ type: mockSequelize.QueryTypes.SELECT })
    );
  });

  it('returns a semester by id', async () => {
    const semester = { id: 2, name: 'Semester 2 2025', year: 2025, semester_number: 2 };
    mockSequelize.query.mockResolvedValueOnce([semester]);

    const result = await semesterService.getSemesterById(2);

    expect(result).toEqual(semester);
  });

  it('throws 404 when semester is not found', async () => {
    mockSequelize.query.mockResolvedValueOnce([]);

    await expect(semesterService.getSemesterById(999)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Semester not found',
    });
  });

  it('starts a new semester and deactivates others', async () => {
    const created = { id: 10, name: 'Semester 1 2027', year: 2027, semester_number: 1, is_active: true };

    mockSequelize.query
      .mockResolvedValueOnce(undefined) // deactivate all
      .mockResolvedValueOnce([]) // no existing semester
      .mockResolvedValueOnce(undefined) // insert
      .mockResolvedValueOnce([{ id: 10 }]) // select created id
      .mockResolvedValueOnce([created]); // getSemesterById

    const result = await semesterService.startSemester({
      name: 'Semester 1 2027',
      year: 2027,
      semester_number: 1,
      start_date: '2027-02-01',
      end_date: '2027-06-30',
    });

    expect(mockSequelize.mockTransaction.commit).toHaveBeenCalled();
    expect(result).toEqual(created);
  });

  it('updates an existing semester when starting the same year/number', async () => {
    const updated = { id: 5, name: 'Semester 1 2026 (extended)', year: 2026, semester_number: 1, is_active: true };

    mockSequelize.query
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([{ id: 5 }])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([updated]);

    const result = await semesterService.startSemester({
      name: 'Semester 1 2026 (extended)',
      year: 2026,
      semester_number: 1,
    });

    expect(result).toEqual(updated);
    expect(mockSequelize.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE semesters SET'),
      expect.objectContaining({ transaction: mockSequelize.mockTransaction })
    );
  });

  it('rolls back when startSemester fails', async () => {
    mockSequelize.query
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('db error'));

    await expect(
      semesterService.startSemester({ name: 'Fail', year: 2026, semester_number: 2 })
    ).rejects.toThrow('db error');

    expect(mockSequelize.mockTransaction.rollback).toHaveBeenCalled();
  });

  it('ends a semester and closes registration', async () => {
    const ended = { id: 3, is_active: false, registration_open: false };
    mockSequelize.query
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([ended]);

    const result = await semesterService.endSemester(3);

    expect(result).toEqual(ended);
  });

  it('toggles registration open state', async () => {
    const semester = { id: 4, registration_open: true };
    mockSequelize.query
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([semester]);

    const result = await semesterService.setRegistrationOpen(4, true);

    expect(result).toEqual(semester);
  });
});
