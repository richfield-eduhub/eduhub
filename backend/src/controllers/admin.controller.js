/**
 * Admin — admissions and operational endpoints (admin role only)
 */

const applicationService = require('../services/application.service');
const semesterService = require('../services/semester.service');
const studentService = require('../services/student.service');
const ResponseHandler = require('../utils/responseHandler');

class AdminController {
  /**
   * GET /api/admin/applications
   */
  async listApplications(req, res, next) {
    try {
      const { page, limit, status, campus_id, qualification_id, search } = req.query;

      const result = await applicationService.listApplicationsAdmin({
        page,
        limit,
        status,
        campus_id,
        qualification_id,
        search,
      });

      return ResponseHandler.paginated(
        res,
        result.applications,
        result.pagination,
        'Applications retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/applications/:id
   */
  async getApplication(req, res, next) {
    try {
      const { id } = req.params;
      const row = await applicationService.getApplicationByIdAdmin(id);
      return ResponseHandler.success(res, row, 'Application retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/applications/:id/status
   */
  async updateApplicationStatus(req, res, next) {
    try {
      const { id } = req.params;
      const reviewerId = req.user.user_id;
      const { status, rejection_reason } = req.body;

      const row = await applicationService.updateApplicationStatusAdmin(id, reviewerId, {
        status,
        rejection_reason,
      });

      return ResponseHandler.success(res, row, 'Application status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/stats/applications
   */
  async getApplicationStats(req, res, next) {
    try {
      const rows = await applicationService.getApplicationStatsByStatus();
      return ResponseHandler.success(res, rows, 'Application statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/semesters
   */
  async listSemesters(req, res, next) {
    try {
      const rows = await semesterService.listSemesters();
      return ResponseHandler.success(res, rows, 'Semesters retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/semesters/:id
   */
  async getSemester(req, res, next) {
    try {
      const { id } = req.params;
      const row = await semesterService.getSemesterById(id);
      return ResponseHandler.success(res, row, 'Semester retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/semesters
   * Start / activate a semester (deactivates all others).
   */
  async startSemester(req, res, next) {
    try {
      const row = await semesterService.startSemester(req.body);
      return ResponseHandler.created(res, row, 'Semester started successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/semesters/:id/end
   */
  async endSemester(req, res, next) {
    try {
      const { id } = req.params;
      const row = await semesterService.endSemester(id);
      return ResponseHandler.success(res, row, 'Semester ended successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/semesters/:id/registration
   */
  async setSemesterRegistration(req, res, next) {
    try {
      const { id } = req.params;
      const { registration_open } = req.body;
      const row = await semesterService.setRegistrationOpen(id, Boolean(registration_open));
      return ResponseHandler.success(res, row, 'Registration settings updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/students/:id/account-status
   */
  async setStudentAccountStatus(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.user.user_id;
      const { account_status, status_reason } = req.body;
      const row = await studentService.setStudentAccountStatus(id, adminId, {
        account_status,
        status_reason,
      });
      return ResponseHandler.success(res, row, 'Student account status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
