const { computeCheckDigit, verifyLuhn } = require('../../src/studentNumber/luhn');

describe('Luhn check digit', () => {
  describe('computeCheckDigit', () => {
    it('computes check digit for a 9-digit base', () => {
      const checkDigit = computeCheckDigit('261000001');
      expect(checkDigit).toMatch(/^\d$/);
      expect(verifyLuhn(`261000001${checkDigit}`)).toBe(true);
    });

    it('throws for invalid input length', () => {
      expect(() => computeCheckDigit('12345')).toThrow(
        'computeCheckDigit expects a 9-digit numeric string'
      );
    });

    it('throws for non-numeric input', () => {
      expect(() => computeCheckDigit('abcdefghi')).toThrow(
        'computeCheckDigit expects a 9-digit numeric string'
      );
    });
  });

  describe('verifyLuhn', () => {
    it('returns true for a valid 10-digit number', () => {
      const base = '261000001';
      const full = `${base}${computeCheckDigit(base)}`;
      expect(verifyLuhn(full)).toBe(true);
    });

    it('returns false for invalid check digit', () => {
      const base = '261000001';
      const wrongCheck = computeCheckDigit(base) === '0' ? '1' : '0';
      expect(verifyLuhn(`${base}${wrongCheck}`)).toBe(false);
    });

    it('returns false for wrong length', () => {
      expect(verifyLuhn('123')).toBe(false);
      expect(verifyLuhn('')).toBe(false);
    });
  });
});
