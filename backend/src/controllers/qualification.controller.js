/**
 * Qualification Controller
 * Handles qualification-related endpoints
 */

const qualificationService = require('../services/qualification.service');
const ResponseHandler = require('../utils/responseHandler');

class QualificationController {
  /**
   * GET /api/qualifications
   * Get all qualifications
   */
  async getAllQualifications(req, res, next) {
    try {
      const { active_only } = req.query;

      const qualifications = await qualificationService.getAllQualifications({
        active_only: active_only === 'true',
      });

      return ResponseHandler.success(
        res,
        qualifications,
        'Qualifications retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/qualifications/:id
   * Get qualification by ID with modules
   */
  async getQualificationById(req, res, next) {
    try {
      const { id } = req.params;

      const qualification = await qualificationService.getQualificationById(id);

      return ResponseHandler.success(
        res,
        qualification,
        'Qualification retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QualificationController();
