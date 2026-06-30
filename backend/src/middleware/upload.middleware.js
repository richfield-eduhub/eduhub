/**
 * File Upload Middleware
 *
 * Handles multipart/form-data file uploads using multer
 *
 * REQUIRED: npm install multer
 *
 * Usage:
 * - uploadSingle('fieldName') - Single file upload
 * - uploadMultiple('fieldName', maxCount) - Multiple files
 * - uploadFields([{name, maxCount}]) - Multiple fields
 */

const { FileUploadUtility, FILE_CONFIG } = require('../utils/fileUpload');

// Multer configuration (will be available after npm install multer)
let multer, upload;

try {
  multer = require('multer');

  // Configure multer storage
  const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        // Generate UUID folder structure
        const fileInfo = FileUploadUtility.generateUniqueFilename(file.originalname);

        // Store fileInfo on request for later use
        if (!req.fileInfo) req.fileInfo = {};
        req.fileInfo[file.fieldname] = fileInfo;

        // Create base upload directory
        const basePath = await FileUploadUtility.ensureUploadDirectory();

        // Create UUID subfolder
        const fs = require('fs').promises;
        const uuidFolderPath = require('path').join(basePath, fileInfo.folder);
        await fs.mkdir(uuidFolderPath, { recursive: true });

        cb(null, uuidFolderPath);
      } catch (error) {
        cb(error);
      }
    },
    filename: (req, file, cb) => {
      // Use the filename from fileInfo stored in destination callback
      const fileInfo = req.fileInfo?.[file.fieldname];
      if (!fileInfo) {
        return cb(new Error('File info not generated'));
      }
      cb(null, fileInfo.filename);
    },
  });

  // File filter
  const fileFilter = (req, file, cb) => {
    // Validate file type
    if (!FileUploadUtility.isValidFileType(file.mimetype)) {
      return cb(new Error(`Invalid file type. Allowed types: ${Object.keys(FILE_CONFIG.ALLOWED_TYPES).join(', ')}`), false);
    }

    // Validate extension
    if (!FileUploadUtility.isValidExtension(file.originalname)) {
      return cb(new Error(`Invalid file extension. Allowed: ${FILE_CONFIG.ALLOWED_EXTENSIONS.join(', ')}`), false);
    }

    cb(null, true);
  };

  // Create multer instance
  upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: FILE_CONFIG.MAX_FILE_SIZE,
    },
  });
} catch (error) {
  console.warn('⚠️  File upload middleware failed to initialize:', error.message);
  if (error.code === 'MODULE_NOT_FOUND') {
    console.warn('   Run: npm install multer');
  }

  // Create mock upload functions so the app still starts
  upload = {
    single: () => (req, res, next) => {
      next(
        new Error(
          error.code === 'MODULE_NOT_FOUND'
            ? 'multer is not installed. Run: npm install multer'
            : `File upload unavailable: ${error.message}`,
        ),
      );
    },
    array: () => (req, res, next) => {
      next(new Error('multer is not installed. Run: npm install multer'));
    },
    fields: () => (req, res, next) => {
      next(new Error('multer is not installed. Run: npm install multer'));
    },
  };
}

/**
 * Middleware for single file upload
 * @param {string} fieldName - Form field name
 */
const uploadSingle = (fieldName) => {
  return upload.single(fieldName);
};

/**
 * Middleware for multiple files upload (same field)
 * @param {string} fieldName - Form field name
 * @param {number} maxCount - Maximum number of files
 */
const uploadMultiple = (fieldName, maxCount = 10) => {
  return upload.array(fieldName, maxCount);
};

/**
 * Middleware for multiple fields with files
 * @param {Array} fields - [{name: string, maxCount: number}]
 */
const uploadFields = (fields) => {
  return upload.fields(fields);
};

/**
 * Error handling middleware for upload errors
 */
const handleUploadError = (err, req, res, next) => {
  if (err && multer) {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: `File too large. Maximum size is ${FILE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`,
        });
      }

      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field',
        });
      }

      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // Custom validation errors
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next(err);
};

/**
 * Middleware to validate uploaded file(s)
 */
const validateUploadedFiles = (req, res, next) => {
  try {
    // Single file
    if (req.file) {
      const validation = FileUploadUtility.validateFile(req.file);

      if (!validation.isValid) {
        // Delete the uploaded file
        const fs = require('fs');
        if (req.file.path) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(400).json({
          success: false,
          message: 'File validation failed',
          errors: validation.errors,
        });
      }

      // Attach metadata
      req.file.metadata = FileUploadUtility.getFileMetadata(
        req.file,
        req.file.filename,
        req.file.destination
      );
    }

    // Multiple files
    if (req.files && Array.isArray(req.files)) {
      const fs = require('fs');
      const validatedFiles = [];
      const errors = [];

      for (const file of req.files) {
        const validation = FileUploadUtility.validateFile(file);

        if (!validation.isValid) {
          // Delete invalid file
          if (file.path) {
            fs.unlinkSync(file.path);
          }
          errors.push(...validation.errors);
        } else {
          file.metadata = FileUploadUtility.getFileMetadata(
            file,
            file.filename,
            file.destination
          );
          validatedFiles.push(file);
        }
      }

      if (errors.length > 0) {
        // Delete all uploaded files
        for (const file of req.files) {
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }

        return res.status(400).json({
          success: false,
          message: 'Some files failed validation',
          errors,
        });
      }

      req.files = validatedFiles;
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  handleUploadError,
  validateUploadedFiles,
};
