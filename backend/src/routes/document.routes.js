/**
 * Document Routes
 *
 * Handles document upload, download, and management endpoints
 */

const express = require('express');
const { body } = require('express-validator');
const documentController = require('../controllers/document.controller');
const { authenticateToken, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validator.middleware');
const {
  uploadSingle,
  handleUploadError,
  validateUploadedFiles,
} = require('../middleware/upload.middleware');

const router = express.Router();

/**
 * Validation rules
 */
const uploadValidation = [
  body('documentType')
    .notEmpty()
    .withMessage('Document type is required')
    .isIn(['ID', 'Certificate', 'Transcript', 'Matric', 'ProofOfPayment', 'Other'])
    .withMessage('Invalid document type'),
];

// ============================================
// Document Upload Routes
// ============================================

// POST /api/applications/:applicationId/documents - Upload document
router.post(
  '/applications/:applicationId/documents',
  authenticateToken,
  uploadSingle('document'),
  handleUploadError,
  validateUploadedFiles,
  uploadValidation,
  validate,
  documentController.uploadDocument
);

// GET /api/applications/:applicationId/documents - Get all documents for application
router.get(
  '/applications/:applicationId/documents',
  authenticateToken,
  documentController.getApplicationDocuments
);

// GET /api/applications/:applicationId/documents/stats - Get document statistics
router.get(
  '/applications/:applicationId/documents/stats',
  authenticateToken,
  documentController.getDocumentStats
);

// GET /api/applications/:applicationId/documents/check - Check required documents
router.get(
  '/applications/:applicationId/documents/check',
  authenticateToken,
  documentController.checkRequiredDocuments
);

// ============================================
// Individual Document Routes
// ============================================

// GET /api/documents/:documentId - Get document metadata
router.get(
  '/documents/:documentId',
  authenticateToken,
  documentController.getDocument
);

// GET /api/documents/:documentId/download - Download document file
// Accepts token from Authorization header OR query parameter
router.get(
  '/documents/:documentId/download',
  (req, res, next) => {
    // Try to get token from query parameter first (for direct links), then header
    const queryToken = req.query.token;
    if (queryToken && !req.headers.authorization) {
      req.headers.authorization = `Bearer ${queryToken}`;
    }
    authenticateToken(req, res, next);
  },
  documentController.downloadDocument
);

// POST /api/documents/:documentId/verify - Verify document (admin only)
router.post(
  '/documents/:documentId/verify',
  authenticateToken,
  authorize(['admin']),
  documentController.verifyDocument
);

// PATCH /api/documents/:documentId/notes - Update document notes
router.patch(
  '/documents/:documentId/notes',
  authenticateToken,
  authorize(['admin', 'lecturer']),
  [body('notes').optional().isString().withMessage('Notes must be a string')],
  validate,
  documentController.updateNotes
);

// DELETE /api/documents/:documentId - Delete document
router.delete(
  '/documents/:documentId',
  authenticateToken,
  documentController.deleteDocument
);

module.exports = router;
