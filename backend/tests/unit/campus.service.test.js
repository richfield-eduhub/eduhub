const { createMockSequelize } = require('../helpers/mockSequelize');

const mockSequelize = createMockSequelize();
jest.mock('../../src/config/database', () => mockSequelize);

const campusService = require('../../src/services/campus.service');

describe('CampusService', () => {
  beforeEach(() => mockSequelize.reset());

  it('returns all campuses', async () => {
    const campuses = [{ id: 1, name: 'Johannesburg Campus' }];
    mockSequelize.query.mockResolvedValueOnce(campuses);

    const result = await campusService.getAllCampuses();
    expect(result).toEqual(campuses);
  });

  it('returns campus by id with counts and qualifications', async () => {
    mockSequelize.query
      .mockResolvedValueOnce([{ id: 1, name: 'Cape Town Campus' }])
      .mockResolvedValueOnce([{ student_count: 10, lecturer_count: 2 }])
      .mockResolvedValueOnce([{ id: 5, name: 'BSc IT' }]);

    const result = await campusService.getCampusById(1);
    expect(result.student_count).toBe(10);
    expect(result.qualifications).toHaveLength(1);
  });

  it('throws when campus is not found', async () => {
    mockSequelize.query.mockResolvedValueOnce([]);

    await expect(campusService.getCampusById(999)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Campus not found',
    });
  });

  it('groups campuses by province', async () => {
    const grouped = [{ province: 'Gauteng', campuses: [] }];
    mockSequelize.query.mockResolvedValueOnce(grouped);

    const result = await campusService.getCampusesByProvince();
    expect(result).toEqual(grouped);
  });

  it('returns campuses for a qualification', async () => {
    const campuses = [{ id: 2, name: 'Durban Campus' }];
    mockSequelize.query.mockResolvedValueOnce(campuses);

    const result = await campusService.getCampusesByQualification(3);
    expect(result).toEqual(campuses);
  });
});
