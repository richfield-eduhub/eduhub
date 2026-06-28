const mfaService = require('../../src/services/mfa.service');

describe('MFAService', () => {
  describe('generateBackupCodes', () => {
    it('generates 10 uppercase hex codes', () => {
      const codes = mfaService.generateBackupCodes();
      expect(codes).toHaveLength(10);
      codes.forEach((code) => {
        expect(code).toMatch(/^[0-9A-F]{8}$/);
      });
    });
  });

  describe('hashBackupCodes', () => {
    it('hashes each backup code', async () => {
      const hashed = await mfaService.hashBackupCodes(['ABCD1234', 'EFGH5678']);
      expect(hashed).toHaveLength(2);
      expect(hashed[0]).not.toBe('ABCD1234');
    });
  });

  describe('verifyTOTP', () => {
    it('returns false for missing secret or code', () => {
      expect(mfaService.verifyTOTP(null, '123456')).toBe(false);
      expect(mfaService.verifyTOTP('SECRET', null)).toBe(false);
    });

    it('returns false for invalid codes', () => {
      const speakeasy = require('speakeasy');
      const secret = speakeasy.generateSecret({ length: 20 }).base32;
      expect(mfaService.verifyTOTP(secret, '000000')).toBe(false);
    });
  });
});
