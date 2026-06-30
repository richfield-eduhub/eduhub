const { createMockSequelize } = require('../helpers/mockSequelize');

const mockSequelize = createMockSequelize();
jest.mock('../../src/config/database', () => mockSequelize);

const lecturerService = require('../../src/services/lecturer.service');

describe('LecturerService', () => {
  beforeEach(() => mockSequelize.reset());

  it('returns paginated lecturers', async () => {
    mockSequelize.query
      .mockResolvedValueOnce([[{ total: 1 }]])
      .mockResolvedValueOnce([{ id: 1, employee_number: 'LEC001' }]);

    const result = await lecturerService.getAllLecturers({ page: 1, limit: 20 });
    expect(result.lecturers).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
  });

  it('throws when lecturer is not found by id', async () => {
    mockSequelize.query.mockResolvedValueOnce([]);

    await expect(lecturerService.getLecturerById(999)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Lecturer not found',
    });
  });

  it('returns lecturer profile by user id', async () => {
    mockSequelize.query.mockResolvedValueOnce([{ id: 2, user_id: 'user-1', employee_number: 'LEC002' }]);

    const lecturer = await lecturerService.getLecturerByUserId('user-1');
    expect(lecturer.employee_number).toBe('LEC002');
  });

  it('rejects lecturer updates with no valid fields', async () => {
    await expect(
      lecturerService.updateLecturer(1, { invalid_field: 'x' })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'No valid fields to update',
    });
  });

  it('returns modules assigned to a lecturer', async () => {
    mockSequelize.query.mockResolvedValueOnce([
      { id: 'mod-1', code: 'IT101', student_count: 25 },
    ]);

    const modules = await lecturerService.getLecturerModules(3, { active_only: true });
    expect(modules[0].code).toBe('IT101');
  });
});
