const { FileUploadUtility, FILE_CONFIG } = require('../../src/utils/fileUpload');

describe('FileUploadUtility', () => {
  describe('validation helpers', () => {
    it('accepts allowed MIME types', () => {
      expect(FileUploadUtility.isValidFileType('application/pdf')).toBe(true);
      expect(FileUploadUtility.isValidFileType('image/jpeg')).toBe(true);
      expect(FileUploadUtility.isValidFileType('image/png')).toBe(true);
    });

    it('rejects disallowed MIME types', () => {
      expect(FileUploadUtility.isValidFileType('application/exe')).toBe(false);
    });

    it('validates file extensions', () => {
      expect(FileUploadUtility.isValidExtension('document.pdf')).toBe(true);
      expect(FileUploadUtility.isValidExtension('photo.JPG')).toBe(true);
      expect(FileUploadUtility.isValidExtension('virus.exe')).toBe(false);
    });

    it('validates file size against 5MB limit', () => {
      expect(FileUploadUtility.isValidFileSize(1024)).toBe(true);
      expect(FileUploadUtility.isValidFileSize(FILE_CONFIG.MAX_FILE_SIZE)).toBe(true);
      expect(FileUploadUtility.isValidFileSize(FILE_CONFIG.MAX_FILE_SIZE + 1)).toBe(false);
    });
  });

  describe('sanitizeFilename', () => {
    it('removes path traversal and special characters', () => {
      expect(FileUploadUtility.sanitizeFilename('../../etc/passwd')).toBe('passwd');
      expect(FileUploadUtility.sanitizeFilename('my document (1).pdf')).toBe('my_document_1.pdf');
    });

    it('truncates very long filenames', () => {
      const longName = `${'a'.repeat(120)}.pdf`;
      expect(FileUploadUtility.sanitizeFilename(longName).length).toBeLessThanOrEqual(100);
    });
  });

  describe('generateUniqueFilename', () => {
    it('produces unique names preserving extension', () => {
      const name1 = FileUploadUtility.generateUniqueFilename('report.pdf');
      const name2 = FileUploadUtility.generateUniqueFilename('report.pdf');
      expect(name1).toMatch(/\.pdf$/);
      expect(name2).toMatch(/\.pdf$/);
      expect(name1).not.toBe(name2);
    });
  });

  describe('validateFile', () => {
    it('rejects missing file', () => {
      const result = FileUploadUtility.validateFile(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('No file provided');
    });

    it('accepts a valid PDF upload', () => {
      const result = FileUploadUtility.validateFile({
        originalname: 'id_copy.pdf',
        mimetype: 'application/pdf',
        size: 1024,
      });
      expect(result.isValid).toBe(true);
      expect(result.sanitizedFilename).toBe('id_copy.pdf');
    });

    it('rejects oversized files', () => {
      const result = FileUploadUtility.validateFile({
        originalname: 'large.pdf',
        mimetype: 'application/pdf',
        size: FILE_CONFIG.MAX_FILE_SIZE + 1,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('File size exceeds maximum limit');
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes into human-readable units', () => {
      expect(FileUploadUtility.formatFileSize(0)).toBe('0 Bytes');
      expect(FileUploadUtility.formatFileSize(1024)).toBe('1 KB');
      expect(FileUploadUtility.formatFileSize(1048576)).toBe('1 MB');
    });
  });

  describe('getFileMetadata', () => {
    it('returns structured metadata for a file', () => {
      const file = {
        originalname: 'cert.pdf',
        mimetype: 'application/pdf',
        size: 2048,
      };
      const metadata = FileUploadUtility.getFileMetadata(file, 'uuid_123.pdf', '/tmp/uploads');
      expect(metadata.originalName).toBe('cert.pdf');
      expect(metadata.uniqueFilename).toBe('uuid_123.pdf');
      expect(metadata.extension).toBe('.pdf');
    });
  });
});
