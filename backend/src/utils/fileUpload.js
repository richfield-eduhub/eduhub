/**
 * File Upload Utility
 *
 * Handles file validation, sanitization, and storage
 *
 * REQUIRED PACKAGES (install these first):
 * npm install multer file-type@16.5.4 sanitize-filename
 *
 * Design Reference: MISSING_FEATURES.md section 2.2, Pages 44-45
 */

const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

// File upload configuration
const FILE_CONFIG = {
  // Maximum file size (5MB in bytes)
  MAX_FILE_SIZE: 5 * 1024 * 1024,

  // Allowed file types
  ALLOWED_TYPES: {
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
  },

  // Allowed extensions
  ALLOWED_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png'],

  // Document types for applications
  DOCUMENT_TYPES: {
    ID: 'ID',
    CERTIFICATE: 'Certificate',
    TRANSCRIPT: 'Transcript',
    MATRIC: 'Matric',
    PROOF_OF_PAYMENT: 'ProofOfPayment',
    OTHER: 'Other',
  },

  // Storage base path
  UPLOAD_BASE_PATH: path.join(__dirname, '../../uploads'),
};

class FileUploadUtility {
  /**
   * Validate file type
   */
  static isValidFileType(mimetype) {
    return Object.keys(FILE_CONFIG.ALLOWED_TYPES).includes(mimetype);
  }

  /**
   * Validate file extension
   */
  static isValidExtension(filename) {
    const ext = path.extname(filename).toLowerCase();
    return FILE_CONFIG.ALLOWED_EXTENSIONS.includes(ext);
  }

  /**
   * Validate file size
   */
  static isValidFileSize(size) {
    return size <= FILE_CONFIG.MAX_FILE_SIZE;
  }

  /**
   * Sanitize filename
   * Removes dangerous characters and normalizes the name
   */
  static sanitizeFilename(filename) {
    // Remove path traversal attempts
    const name = path.basename(filename);

    // Replace spaces with underscores
    let sanitized = name.replace(/\s+/g, '_');

    // Remove special characters except dots, dashes, and underscores
    sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '');

    // Limit length
    if (sanitized.length > 100) {
      const ext = path.extname(sanitized);
      const nameWithoutExt = sanitized.slice(0, 100 - ext.length);
      sanitized = nameWithoutExt + ext;
    }

    return sanitized;
  }

  /**
   * Generate unique filename
   * Format: uuid_timestamp.ext
   */
  static generateUniqueFilename(originalFilename) {
    const ext = path.extname(originalFilename).toLowerCase();
    const uuid = crypto.randomUUID();
    const timestamp = Date.now();

    return `${uuid}_${timestamp}${ext}`;
  }

  /**
   * Get storage path for file
   * Format: /uploads/YEAR/MONTH/
   */
  static getStoragePath() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    return path.join(FILE_CONFIG.UPLOAD_BASE_PATH, String(year), month);
  }

  /**
   * Get full file path
   */
  static getFullFilePath(filename) {
    const storagePath = this.getStoragePath();
    return path.join(storagePath, filename);
  }

  /**
   * Ensure upload directory exists
   */
  static async ensureUploadDirectory() {
    const storagePath = this.getStoragePath();

    try {
      await fs.access(storagePath);
    } catch (error) {
      // Directory doesn't exist, create it
      await fs.mkdir(storagePath, { recursive: true });
    }

    return storagePath;
  }

  /**
   * Validate file completely
   */
  static validateFile(file) {
    const errors = [];

    if (!file) {
      return { isValid: false, errors: ['No file provided'] };
    }

    // Check file size
    if (!this.isValidFileSize(file.size)) {
      errors.push(`File size exceeds maximum limit of ${FILE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    // Check MIME type
    if (!this.isValidFileType(file.mimetype)) {
      const allowedTypes = Object.keys(FILE_CONFIG.ALLOWED_TYPES).join(', ');
      errors.push(`Invalid file type. Allowed types: ${allowedTypes}`);
    }

    // Check extension
    if (!this.isValidExtension(file.originalname)) {
      errors.push(`Invalid file extension. Allowed: ${FILE_CONFIG.ALLOWED_EXTENSIONS.join(', ')}`);
    }

    // Check filename
    const sanitized = this.sanitizeFilename(file.originalname);
    if (!sanitized || sanitized.length === 0) {
      errors.push('Invalid filename');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedFilename: sanitized,
    };
  }

  /**
   * Get file metadata
   */
  static getFileMetadata(file, uniqueFilename, storagePath) {
    const relativePath = path.relative(FILE_CONFIG.UPLOAD_BASE_PATH, path.join(storagePath, uniqueFilename));

    return {
      originalName: file.originalname,
      sanitizedName: this.sanitizeFilename(file.originalname),
      uniqueFilename,
      size: file.size,
      mimetype: file.mimetype,
      extension: path.extname(file.originalname).toLowerCase(),
      storagePath: relativePath,
      fullPath: path.join(storagePath, uniqueFilename),
    };
  }

  /**
   * Delete file from storage
   */
  static async deleteFile(filePath) {
    try {
      const fullPath = path.join(FILE_CONFIG.UPLOAD_BASE_PATH, filePath);
      await fs.unlink(fullPath);
      return { success: true };
    } catch (error) {
      console.error('Error deleting file:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get file size formatted
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Check if file exists
   */
  static async fileExists(filePath) {
    try {
      const fullPath = path.join(FILE_CONFIG.UPLOAD_BASE_PATH, filePath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}

// Export configuration and utility
module.exports = {
  FileUploadUtility,
  FILE_CONFIG,
};
