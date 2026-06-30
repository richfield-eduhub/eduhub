/**
 * Public admissions — no authentication
 */

const applicationService = require('../services/application.service');
const documentService = require('../services/document.service');
const ResponseHandler = require('../utils/responseHandler');

class ApplicationController {
  async checkIdentityStatus(req, res, next) {
    try {
      const { nationality, id_number, passport_number } = req.query;
      const result = await applicationService.checkIdentityStatus({
        nationality,
        id_number,
        passport_number,
      });
      return ResponseHandler.success(res, result, 'Identity status retrieved');
    } catch (error) {
      next(error);
    }
  }

  async checkContactAvailability(req, res, next) {
    try {
      const { email, phone, draft_id, id_number, passport_number } = req.query;
      const result = await applicationService.checkContactAvailability({
        email,
        phone,
        draft_id,
        id_number,
        passport_number,
      });
      return ResponseHandler.success(res, result, 'Contact availability checked');
    } catch (error) {
      next(error);
    }
  }

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

  async startDraft(req, res, next) {
    try {
      console.log('=== START DRAFT REQUEST ===');
      console.log('Body:', JSON.stringify(req.body, null, 2));
      console.log('Headers:', JSON.stringify(req.headers, null, 2));
      console.log('========================');
      const result = await applicationService.startOrResumeDraft(req.body);
      return ResponseHandler.success(res, result, result.resumed ? 'Draft resumed successfully' : 'Draft started successfully');
    } catch (error) {
      console.log('=== START DRAFT ERROR ===');
      console.log('Error:', error);
      console.log('========================');
      next(error);
    }
  }

  async getDraft(req, res, next) {
    try {
      const result = await applicationService.getDraftById(req.params.draftId);
      return ResponseHandler.success(res, result, 'Draft retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateDraft(req, res, next) {
    try {
      console.log('=== UPDATE DRAFT REQUEST ===');
      console.log('Draft ID:', req.params.draftId);
      console.log('Body:', JSON.stringify(req.body, null, 2));
      console.log('========================');
      const result = await applicationService.updateDraft(req.params.draftId, req.body);
      return ResponseHandler.success(res, result, 'Draft updated successfully');
    } catch (error) {
      console.log('=== UPDATE DRAFT ERROR ===');
      console.log('Error:', error);
      console.log('========================');
      next(error);
    }
  }

  async createDraftPaymentIntent(req, res, next) {
    try {
      const result = await applicationService.createDraftPaymentIntent(req.params.draftId);
      return ResponseHandler.success(res, result, 'Payment intent created successfully');
    } catch (error) {
      next(error);
    }
  }

  async confirmDraftPayment(req, res, next) {
    try {
      const result = await applicationService.confirmDraftPayment(req.params.draftId, req.body);
      return ResponseHandler.success(res, result, 'Payment confirmation processed');
    } catch (error) {
      next(error);
    }
  }

  async submitDraft(req, res, next) {
    try {
      const result = await applicationService.submitDraft(req.params.draftId);
      return ResponseHandler.success(res, result, 'Draft submitted successfully');
    } catch (error) {
      next(error);
    }
  }

  async evaluateAps(req, res, next) {
    try {
      const result = await applicationService.evaluateApsEligibility(req.body);
      return ResponseHandler.success(res, result, 'APS eligibility evaluated successfully');
    } catch (error) {
      next(error);
    }
  }

  async uploadDraftDocument(req, res, next) {
    try {
      const { draftId } = req.params;
      const { documentType } = req.body;

      await applicationService.assertDraftAllowsUpload(draftId);

      if (!req.file) {
        return ResponseHandler.badRequest(res, 'No file uploaded');
      }
      if (!documentType) {
        return ResponseHandler.badRequest(res, 'Document type is required');
      }

      const document = await documentService.saveDocument({
        applicationId: draftId,
        documentType,
        file: req.file,
        uploadedBy: req.user?.user_id || null,
      });

      return ResponseHandler.created(res, document, 'Document uploaded successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ApplicationController();
