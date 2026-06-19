/**
 * Document Controller
 *
 * Handles document upload, download, verification, and management endpoints
 */

const documentService = require('../services/document.service');
const ResponseHandler = require('../utils/responseHandler');
const path = require('path');
const { FILE_CONFIG } = require('../utils/fileUpload');

class DocumentController {
  /**
   * POST /api/applications/:applicationId/documents
   * Upload document for an application
   */
  async uploadDocument(req, res, next) {
    try {
      const { applicationId } = req.params;
      const { documentType } = req.body;
      const uploadedBy = req.user?.user_id;

      if (!req.file) {
        return ResponseHandler.badRequest(res, 'No file uploaded');
      }

      if (!documentType) {
        return ResponseHandler.badRequest(res, 'Document type is required');
      }

      const document = await documentService.saveDocument({
        applicationId,
        documentType,
        file: req.file,
        uploadedBy,
      });

      return ResponseHandler.created(res, document, 'Document uploaded successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/applications/:applicationId/documents
   * Get all documents for an application
   */
  async getApplicationDocuments(req, res, next) {
    try {
      const { applicationId } = req.params;

      const documents = await documentService.getApplicationDocuments(applicationId);

      return ResponseHandler.success(res, documents);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/documents/:documentId
   * Get document by ID
   */
  async getDocument(req, res, next) {
    try {
      const { documentId } = req.params;

      const document = await documentService.getDocumentById(documentId);

      return ResponseHandler.success(res, document);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/documents/:documentId/download
   * Download document file
   */
  async downloadDocument(req, res, next) {
    try {
      const { documentId } = req.params;

      const document = await documentService.getDocumentById(documentId);

      const filePath = path.join(FILE_CONFIG.UPLOAD_BASE_PATH, document.file_path);

      // Check if file exists
      const fs = require('fs');
      if (!fs.existsSync(filePath)) {
        return ResponseHandler.notFound(res, 'File not found on server');
      }

      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${document.file_name}"`);
      res.setHeader('Content-Type', document.mime_type);

      // Send file
      return res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/documents/:documentId/verify
   * Verify document (admin only)
   */
  async verifyDocument(req, res, next) {
    try {
      const { documentId } = req.params;
      const { notes } = req.body;
      const verifiedBy = req.user.user_id;

      const document = await documentService.verifyDocument(documentId, verifiedBy, notes);

      return ResponseHandler.success(res, document, 'Document verified successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/documents/:documentId
   * Delete document
   */
  async deleteDocument(req, res, next) {
    try {
      const { documentId } = req.params;

      await documentService.deleteDocument(documentId);

      return ResponseHandler.success(res, null, 'Document deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/applications/:applicationId/documents/stats
   * Get document statistics
   */
  async getDocumentStats(req, res, next) {
    try {
      const { applicationId } = req.params;

      const stats = await documentService.getDocumentStats(applicationId);

      return ResponseHandler.success(res, stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/applications/:applicationId/documents/check
   * Check if required documents are uploaded
   */
  async checkRequiredDocuments(req, res, next) {
    try {
      const { applicationId } = req.params;

      const check = await documentService.checkRequiredDocuments(applicationId);

      return ResponseHandler.success(res, check);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/documents/:documentId/notes
   * Update document notes
   */
  async updateNotes(req, res, next) {
    try {
      const { documentId } = req.params;
      const { notes } = req.body;
      const updatedBy = req.user.user_id;

      const document = await documentService.updateDocumentNotes(documentId, notes, updatedBy);

      return ResponseHandler.success(res, document, 'Notes updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DocumentController();
