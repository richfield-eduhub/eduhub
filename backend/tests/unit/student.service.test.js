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
});
