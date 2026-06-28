jest.mock('../../src/services/campus.service');
jest.mock('../../src/utils/responseHandler', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

const campusService = require('../../src/services/campus.service');
const ResponseHandler = require('../../src/utils/responseHandler');
const campusController = require('../../src/controllers/campus.controller');
const { mockRes, mockReq } = require('../helpers/mockSequelize');

describe('CampusController', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns all campuses', async () => {
    const campuses = [{ id: 1, name: 'Johannesburg' }];
    campusService.getAllCampuses.mockResolvedValueOnce(campuses);
    const res = mockRes();

    await campusController.getAllCampuses(mockReq({ query: {} }), res);

    expect(ResponseHandler.success).toHaveBeenCalledWith(
      res,
      campuses,
      'Campuses retrieved successfully'
    );
  });

  it('returns campus by id', async () => {
    const campus = { id: 2, name: 'Cape Town' };
    campusService.getCampusById.mockResolvedValueOnce(campus);
    const res = mockRes();

    await campusController.getCampusById(mockReq({ params: { id: '2' } }), res);

    expect(campusService.getCampusById).toHaveBeenCalledWith('2');
    expect(ResponseHandler.success).toHaveBeenCalled();
  });

  it('handles service errors', async () => {
    campusService.getCampusById.mockRejectedValueOnce({ statusCode: 404, message: 'Campus not found' });
    const res = mockRes();

    await campusController.getCampusById(mockReq({ params: { id: '999' } }), res);

    expect(ResponseHandler.error).toHaveBeenCalledWith(res, 'Campus not found', 404);
  });
});
