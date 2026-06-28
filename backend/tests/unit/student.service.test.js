const { createMockSequelize } = require('../helpers/mockSequelize');

const mockSequelize = createMockSequelize();
jest.mock('../../src/config/database', () => mockSequelize);

const studentService = require('../../src/services/student.service');

describe('StudentService', () => {
  beforeEach(() => mockSequelize.reset());

  it('returns paginated students', async () => {
    mockSequelize.query
      .mockResolvedValueOnce([{ total: 2 }])
      .mockResolvedValueOnce([
        { student_id: 1, student_number: '2610000010' },
        { student_id: 2, student_number: '2610000011' },
      ]);

    const result = await studentService.getAllStudents({ page: 1, limit: 20 });
    expect(result.students).toHaveLength(2);
    expect(result.pagination.total).toBe(2);
  });

  it('rejects updates with no valid fields', async () => {
    await expect(studentService.updateStudent(1, {})).rejects.toMatchObject({
      statusCode: 400,
      message: 'No valid update fields provided',
    });
  });

  it('throws when student is not found by user id', async () => {
    mockSequelize.query.mockResolvedValueOnce([]);

    await expect(studentService.getStudentByUserId('missing-user')).rejects.toMatchObject({
      statusCode: 404,
      message: 'Student record not found',
    });
  });

  it('returns student registrations list', async () => {
    mockSequelize.query.mockResolvedValueOnce([
      { registration_id: 1, module_code: 'IT101', semester_name: 'Semester 1' },
    ]);

    const registrations = await studentService.getStudentRegistrations(5);
    expect(registrations).toHaveLength(1);
    expect(registrations[0].module_code).toBe('IT101');
  });

  it('rejects invalid account status updates', async () => {
    await expect(
      studentService.setStudentAccountStatus(1, 2, { account_status: 'deleted' })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'account_status must be one of: active, blocked, suspended',
    });
  });

  it('prevents admin from changing their own account status', async () => {
    mockSequelize.query.mockResolvedValueOnce([{ user_id: 'admin-1', role: 'student' }]);

    await expect(
      studentService.setStudentAccountStatus(1, 'admin-1', { account_status: 'blocked' })
    ).rejects.toMatchObject({
      statusCode: 403,
      message: 'You cannot change your own account status',
    });
  });
});
