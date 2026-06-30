const { createMockSequelize } = require('../helpers/mockSequelize');

const mockSequelize = createMockSequelize();
jest.mock('../../src/config/database', () => mockSequelize);

const moduleService = require('../../src/services/module.service');

describe('ModuleService', () => {
  beforeEach(() => mockSequelize.reset());

  it('returns all modules', async () => {
    const modules = [{ id: 1, code: 'IT101' }];
    mockSequelize.query.mockResolvedValueOnce(modules);

    const result = await moduleService.getAllModules();
    expect(result).toEqual(modules);
  });

  it('returns modules for a qualification', async () => {
    mockSequelize.query
      .mockResolvedValueOnce([{ id: 1 }])
      .mockResolvedValueOnce([{ id: 2, code: 'IT201' }]);

    const result = await moduleService.getModulesByQualification(1);
    expect(result).toHaveLength(1);
  });

  it('throws when qualification does not exist', async () => {
    mockSequelize.query.mockResolvedValueOnce([]);

    await expect(moduleService.getModulesByQualification(999)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('returns module details with lecturers', async () => {
    mockSequelize.query
      .mockResolvedValueOnce([{ id: 3, code: 'IT301', name: 'Databases' }])
      .mockResolvedValueOnce([{ id: 7, first_name: 'John', last_name: 'Smith' }]);

    const result = await moduleService.getModuleById(3);
    expect(result.lecturers).toHaveLength(1);
  });

  it('returns enrolled students for a module', async () => {
    const students = [{ student_number: '2610000010', first_name: 'Thabo' }];
    mockSequelize.query.mockResolvedValueOnce(students);

    const result = await moduleService.getModuleStudents(3, 1);
    expect(result).toEqual(students);
  });
});
