jest.mock('../../src/services/qualification.service');
jest.mock('../../src/utils/responseHandler', () => ({
  success: jest.fn(),
}));

const qualificationService = require('../../src/services/qualification.service');
const ResponseHandler = require('../../src/utils/responseHandler');
const qualificationController = require('../../src/controllers/qualification.controller');
const { mockRes, mockReq } = require('../helpers/mockSequelize');

describe('QualificationController', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns all qualifications', async () => {
    const qualifications = [{ id: 1, code: 'BSCIT' }];
    qualificationService.getAllQualifications.mockResolvedValueOnce(qualifications);
    const res = mockRes();

    await qualificationController.getAllQualifications(mockReq({ query: {} }), res, jest.fn());

    expect(ResponseHandler.success).toHaveBeenCalledWith(
      res,
      qualifications,
      'Qualifications retrieved successfully'
    );
  });

  it('returns qualification by id', async () => {
    const qualification = { id: 1, modules: [] };
    qualificationService.getQualificationById.mockResolvedValueOnce(qualification);
    const res = mockRes();

    await qualificationController.getQualificationById(mockReq({ params: { id: '1' } }), res, jest.fn());

    expect(qualificationService.getQualificationById).toHaveBeenCalledWith('1');
    expect(ResponseHandler.success).toHaveBeenCalled();
  });
});
