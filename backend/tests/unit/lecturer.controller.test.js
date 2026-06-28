jest.mock('../../src/services/lecturer.service');
jest.mock('../../src/utils/responseHandler', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

const lecturerService = require('../../src/services/lecturer.service');
const ResponseHandler = require('../../src/utils/responseHandler');
const lecturerController = require('../../src/controllers/lecturer.controller');
const { mockRes, mockReq } = require('../helpers/mockSequelize');

describe('LecturerController', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns paginated lecturers', async () => {
    const payload = {
      lecturers: [{ id: 1, employee_number: 'LEC001' }],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    };
    lecturerService.getAllLecturers.mockResolvedValueOnce(payload);
    const res = mockRes();

    await lecturerController.getAllLecturers(mockReq({ query: { page: '1', limit: '20' } }), res);

    expect(ResponseHandler.success).toHaveBeenCalledWith(
      res,
      payload.lecturers,
      'Lecturers retrieved successfully',
      200,
      { pagination: payload.pagination }
    );
  });

  it('returns lecturer profile for current user', async () => {
    const lecturer = { id: 2, employee_number: 'LEC002' };
    lecturerService.getLecturerByUserId.mockResolvedValueOnce(lecturer);
    const res = mockRes();

    await lecturerController.getMyProfile(mockReq({ user: { id: 'user-1' } }), res);

    expect(lecturerService.getLecturerByUserId).toHaveBeenCalledWith('user-1');
    expect(ResponseHandler.success).toHaveBeenCalledWith(
      res,
      lecturer,
      'Lecturer profile retrieved successfully'
    );
  });

  it('returns modules assigned to the current lecturer', async () => {
    const lecturer = { id: 3 };
    const modules = [{ id: 'mod-1', code: 'IT101' }];
    lecturerService.getLecturerByUserId.mockResolvedValueOnce(lecturer);
    lecturerService.getLecturerModules.mockResolvedValueOnce(modules);
    const res = mockRes();

    await lecturerController.getMyModules(
      mockReq({ user: { user_id: 'user-2' }, query: { active_only: 'true' } }),
      res
    );

    expect(lecturerService.getLecturerModules).toHaveBeenCalledWith(3, {
      semester_id: undefined,
      active_only: true,
    });
    expect(ResponseHandler.success).toHaveBeenCalledWith(
      res,
      modules,
      'Lecturer modules retrieved successfully'
    );
  });

  it('handles service errors when fetching lecturer by id', async () => {
    lecturerService.getLecturerById.mockRejectedValueOnce({
      statusCode: 404,
      message: 'Lecturer not found',
    });
    const res = mockRes();

    await lecturerController.getLecturerById(mockReq({ params: { id: '999' } }), res);

    expect(ResponseHandler.error).toHaveBeenCalledWith(res, 'Lecturer not found', 404);
  });
});
