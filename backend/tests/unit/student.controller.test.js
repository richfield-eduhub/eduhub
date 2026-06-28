jest.mock('../../src/services/student.service');
jest.mock('../../src/utils/responseHandler', () => ({
  success: jest.fn(),
  paginated: jest.fn(),
  badRequest: jest.fn(),
}));

const studentService = require('../../src/services/student.service');
const ResponseHandler = require('../../src/utils/responseHandler');
const studentController = require('../../src/controllers/student.controller');
const { mockRes, mockReq } = require('../helpers/mockSequelize');

describe('StudentController', () => {
  const next = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('returns paginated students', async () => {
    const payload = {
      students: [{ student_id: 1 }],
      pagination: { page: 1, limit: 20, total: 1 },
    };
    studentService.getAllStudents.mockResolvedValueOnce(payload);
    const res = mockRes();

    await studentController.getAllStudents(mockReq({ query: { page: '1', limit: '20' } }), res, next);

    expect(studentService.getAllStudents).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      status: undefined,
      search: undefined,
    });
    expect(ResponseHandler.paginated).toHaveBeenCalledWith(
      res,
      payload.students,
      payload.pagination,
      'Students retrieved successfully'
    );
  });

  it('returns student profile for current user', async () => {
    const student = { student_id: 7, student_number: '2610000010' };
    studentService.getStudentByUserId.mockResolvedValueOnce(student);
    const res = mockRes();

    await studentController.getMyProfile(
      mockReq({ user: { user_id: 'user-uuid' } }),
      res,
      next
    );

    expect(studentService.getStudentByUserId).toHaveBeenCalledWith('user-uuid');
    expect(ResponseHandler.success).toHaveBeenCalledWith(
      res,
      student,
      'Profile retrieved successfully'
    );
  });

  it('rejects profile photo upload without a file', async () => {
    const res = mockRes();

    await studentController.uploadProfilePhoto(mockReq({ params: { id: '1' } }), res, next);

    expect(ResponseHandler.badRequest).toHaveBeenCalledWith(res, 'No file uploaded');
    expect(studentService.uploadProfilePhoto).not.toHaveBeenCalled();
  });

  it('forwards service errors to next middleware', async () => {
    const error = { statusCode: 404, message: 'Student not found' };
    studentService.getStudentById.mockRejectedValueOnce(error);
    const res = mockRes();

    await studentController.getStudentById(mockReq({ params: { id: '999' } }), res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
