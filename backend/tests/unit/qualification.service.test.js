const { createMockSequelize } = require('../helpers/mockSequelize');

const mockSequelize = createMockSequelize();
jest.mock('../../src/config/database', () => mockSequelize);

const qualificationService = require('../../src/services/qualification.service');

describe('QualificationService', () => {
  beforeEach(() => mockSequelize.reset());

  it('returns all qualifications', async () => {
    const qualifications = [{ id: 1, code: 'BSCIT', name: 'BSc IT' }];
    mockSequelize.query.mockResolvedValueOnce(qualifications);

    const result = await qualificationService.getAllQualifications();
    expect(result).toEqual(qualifications);
  });

  it('returns qualification with modules', async () => {
    mockSequelize.query
      .mockResolvedValueOnce([{ id: 1, code: 'DIT', name: 'Diploma IT' }])
      .mockResolvedValueOnce([{ id: 10, code: 'IT101', name: 'Intro to IT' }]);

    const result = await qualificationService.getQualificationById(1);
    expect(result.modules).toHaveLength(1);
  });

  it('throws when qualification is not found', async () => {
    mockSequelize.query.mockResolvedValueOnce([]);

    await expect(qualificationService.getQualificationById(999)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
