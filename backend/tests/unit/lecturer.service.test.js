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
});
