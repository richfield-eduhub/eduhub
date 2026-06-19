/**
 * Document Service
 *
 * Handles document upload, retrieval, verification, and deletion
 * Works with application_documents table
 *
 * Design Reference: MISSING_FEATURES.md section 2.2
 */

const sequelize = require('../config/database');
const { FileUploadUtility } = require('../utils/fileUpload');

class DocumentService {
  /**
   * Save document metadata to database
   */
  async saveDocument({
    applicationId,
    documentType,
    file,
    uploadedBy,
  }) {
    const metadata = file.metadata || FileUploadUtility.getFileMetadata(
      file,
      file.filename,
      file.destination
    );

    try {
      const [result] = await sequelize.query(
        `INSERT INTO application_documents
         (application_id, document_type, file_name, file_path, file_size, mime_type, uploaded_by, uploaded_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
         RETURNING id, application_id, document_type, file_name, file_path, file_size, mime_type, uploaded_at`,
        {
          replacements: [
            applicationId,
            documentType,
            metadata.originalName,
            metadata.storagePath,
            file.size,
            file.mimetype,
            uploadedBy || null,
          ],
        }
      );

      return result[0];
    } catch (error) {
      // If database save fails, delete the uploaded file
      await FileUploadUtility.deleteFile(metadata.storagePath);
      throw error;
    }
  }

  /**
   * Get all documents for an application
   */
  async getApplicationDocuments(applicationId) {
    const documents = await sequelize.query(
      `SELECT
         ad.id,
         ad.application_id,
         ad.document_type,
         ad.file_name,
         ad.file_path,
         ad.file_size,
         ad.mime_type,
         ad.is_verified,
         ad.verified_by,
         ad.verified_at,
         ad.notes,
         ad.uploaded_at,
         ad.uploaded_by,
         u1.email as uploader_email,
         u2.email as verifier_email
       FROM application_documents ad
       LEFT JOIN Users u1 ON ad.uploaded_by = u1.id
       LEFT JOIN Users u2 ON ad.verified_by = u2.id
       WHERE ad.application_id = ?
       ORDER BY ad.uploaded_at DESC`,
      {
        replacements: [applicationId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return documents.map(doc => ({
      ...doc,
      formatted_size: FileUploadUtility.formatFileSize(doc.file_size),
    }));
  }

  /**
   * Get document by ID
   */
  async getDocumentById(documentId) {
    const documents = await sequelize.query(
      `SELECT
         ad.*,
         u1.email as uploader_email,
         u2.email as verifier_email
       FROM application_documents ad
       LEFT JOIN Users u1 ON ad.uploaded_by = u1.id
       LEFT JOIN Users u2 ON ad.verified_by = u2.id
       WHERE ad.id = ?`,
      {
        replacements: [documentId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const doc = documents[0];
    if (!doc) {
      throw { statusCode: 404, message: 'Document not found' };
    }

    return {
      ...doc,
      formatted_size: FileUploadUtility.formatFileSize(doc.file_size),
    };
  }

  /**
   * Verify document (admin only)
   */
  async verifyDocument(documentId, verifiedBy, notes = null) {
    await sequelize.query(
      `UPDATE application_documents
       SET is_verified = true,
           verified_by = ?,
           verified_at = NOW(),
           notes = ?,
           updated_at = NOW()
       WHERE id = ?`,
      {
        replacements: [verifiedBy, notes, documentId],
      }
    );

    return await this.getDocumentById(documentId);
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId) {
    // Get document info first
    const doc = await this.getDocumentById(documentId);

    // Delete file from storage
    await FileUploadUtility.deleteFile(doc.file_path);

    // Delete from database
    await sequelize.query(
      `DELETE FROM application_documents WHERE id = ?`,
      { replacements: [documentId] }
    );

    return { success: true, message: 'Document deleted successfully' };
  }

  /**
   * Get documents by type for an application
   */
  async getDocumentsByType(applicationId, documentType) {
    const documents = await sequelize.query(
      `SELECT *
       FROM application_documents
       WHERE application_id = ? AND document_type = ?
       ORDER BY uploaded_at DESC`,
      {
        replacements: [applicationId, documentType],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return documents.map(doc => ({
      ...doc,
      formatted_size: FileUploadUtility.formatFileSize(doc.file_size),
    }));
  }

  /**
   * Check if required documents are uploaded
   */
  async checkRequiredDocuments(applicationId) {
    const requiredTypes = ['ID', 'Matric', 'ProofOfPayment'];

    const documents = await this.getApplicationDocuments(applicationId);
    const uploadedTypes = documents.map(d => d.document_type);

    const missing = requiredTypes.filter(type => !uploadedTypes.includes(type));

    return {
      isComplete: missing.length === 0,
      uploaded: uploadedTypes,
      missing,
      documents,
    };
  }

  /**
   * Get document statistics for an application
   */
  async getDocumentStats(applicationId) {
    const stats = await sequelize.query(
      `SELECT
         COUNT(*) as total_documents,
         SUM(file_size) as total_size,
         COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_count,
         COUNT(CASE WHEN is_verified = false THEN 1 END) as unverified_count
       FROM application_documents
       WHERE application_id = ?`,
      {
        replacements: [applicationId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const result = stats[0];

    return {
      totalDocuments: parseInt(result.total_documents) || 0,
      totalSize: parseInt(result.total_size) || 0,
      formattedTotalSize: FileUploadUtility.formatFileSize(parseInt(result.total_size) || 0),
      verifiedCount: parseInt(result.verified_count) || 0,
      unverifiedCount: parseInt(result.unverified_count) || 0,
    };
  }

  /**
   * Update document notes
   */
  async updateDocumentNotes(documentId, notes, updatedBy) {
    await sequelize.query(
      `UPDATE application_documents
       SET notes = ?,
           updated_at = NOW()
       WHERE id = ?`,
      {
        replacements: [notes, documentId],
      }
    );

    return await this.getDocumentById(documentId);
  }
}

module.exports = new DocumentService();
