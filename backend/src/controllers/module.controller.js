/**
 * Module Controller
 * Handles module-related endpoints
 */

const moduleService = require('../services/module.service');
const ResponseHandler = require('../utils/responseHandler');

class ModuleController {
  /**
   * GET /api/modules
   * Get all modules with optional filtering
   */
  async getAllModules(req, res, next) {
    try {
      const { qualification_id, level, active_only } = req.query;

      const modules = await moduleService.getAllModules({
        qualification_id,
        level: level ? parseInt(level) : undefined,
        active_only: active_only === 'true',
      });

      return ResponseHandler.success(res, modules, 'Modules retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/modules/by-qualification/:qualificationId
   * Modules for a qualification; optional year and/or semester query filters
   */
  async getModulesByQualification(req, res, next) {
    try {
      const { qualificationId } = req.params;
      const { year, semester, active_only } = req.query;

      const modules = await moduleService.getModulesByQualification(qualificationId, {
        year: year !== undefined && year !== '' ? parseInt(year, 10) : undefined,
        semester:
          semester !== undefined && semester !== '' ? parseInt(semester, 10) : undefined,
        active_only: active_only === 'true',
      });

      return ResponseHandler.success(res, modules, 'Modules retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/modules/:id
   * Get module by ID with lecturers
   */
  async getModuleById(req, res, next) {
    try {
      const { id } = req.params;

      const module = await moduleService.getModuleById(id);

      return ResponseHandler.success(res, module, 'Module retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/modules/:id/students
   * Get students enrolled in a module
   */
  async getModuleStudents(req, res, next) {
    try {
      const { id } = req.params;
      const { semester_id } = req.query;

      const students = await moduleService.getModuleStudents(id, semester_id);

      return ResponseHandler.success(
        res,
        students,
        'Module students retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ModuleController();
