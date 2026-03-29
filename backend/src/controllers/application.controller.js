/**
 * Public admissions — no authentication
 */

const applicationService = require('../services/application.service');
const ResponseHandler = require('../utils/responseHandler');

class ApplicationController {
  async createApplication(req, res, next) {
    try {
      const result = await applicationService.createApplication(req.body);
      return ResponseHandler.created(res, result, 'Application created successfully');
    } catch (error) {
      next(error);
    }
  }

  async lookupApplication(req, res, next) {
    try {
      const { reference_number, email } = req.query;
      const row = await applicationService.lookupApplication(reference_number, email);
      return ResponseHandler.success(res, row, 'Application found');
    } catch (error) {
      next(error);
    }
  }

  async getApplication(req, res, next) {
    try {
      const { id } = req.params;
      const { reference_number, email } = req.query;
      const row = await applicationService.getApplicationForApplicant(
        id,
        reference_number,
        email
      );
      return ResponseHandler.success(res, row, 'Application retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateApplication(req, res, next) {
    try {
      const { id } = req.params;
      const { reference_number, email } = req.query;
      const row = await applicationService.updateApplication(
        id,
        reference_number,
        email,
        req.body
      );
      return ResponseHandler.success(res, row, 'Application updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ApplicationController();
