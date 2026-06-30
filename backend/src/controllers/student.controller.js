/**
 * Student Controller
 * Handles student-related endpoints
 */

const studentService = require('../services/student.service');
const ResponseHandler = require('../utils/responseHandler');

class StudentController {
  /**
   * GET /api/students
   * Get all students (Admin/Lecturer only)
   */
  async getAllStudents(req, res, next) {
    try {
      const { page, limit, status, search } = req.query;

      const result = await studentService.getAllStudents({
        page: parseInt(page) || undefined,
        limit: parseInt(limit) || undefined,
        status,
        search,
      });

      return ResponseHandler.paginated(
        res,
        result.students,
        result.pagination,
        'Students retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/students/:id
   * Get student by ID
   */
  async getStudentById(req, res, next) {
    try {
      const { id } = req.params;

      const student = await studentService.getStudentById(id);

      return ResponseHandler.success(res, student, 'Student retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/students/me
   * Get current student's profile (for logged-in students)
   */
  async getMyProfile(req, res, next) {
    try {
      const userId = req.user.user_id;

      const student = await studentService.getStudentByUserId(userId);

      return ResponseHandler.success(res, student, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/students/:id
   * Update student information
   */
  async updateStudent(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const student = await studentService.updateStudent(id, updateData);

      return ResponseHandler.success(res, student, 'Student updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/students/:id/registrations
   * Get student's module registrations
   */
  async getStudentRegistrations(req, res, next) {
    try {
      const { id } = req.params;

      const registrations = await studentService.getStudentRegistrations(id);

      return ResponseHandler.success(
        res,
        registrations,
        'Student registrations retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/students/:id/profile-photo
   * Upload profile photo
   */
  async uploadProfilePhoto(req, res, next) {
    try {
      const { id } = req.params;

      if (!req.file) {
        return ResponseHandler.badRequest(res, 'No file uploaded');
      }

      const result = await studentService.uploadProfilePhoto(id, req.file);

      return ResponseHandler.success(res, result, 'Profile photo uploaded successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/students/:id/profile-photo
   * Delete profile photo
   */
  async deleteProfilePhoto(req, res, next) {
    try {
      const { id } = req.params;

      await studentService.deleteProfilePhoto(id);

      return ResponseHandler.success(res, null, 'Profile photo deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StudentController();
