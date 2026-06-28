const PasswordValidator = require('../../src/utils/passwordValidator');

describe('PasswordValidator', () => {
  describe('validate', () => {
    it('accepts a strong password meeting all requirements', () => {
      const result = PasswordValidator.validate('SecureP@ss9');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects passwords shorter than 8 characters', () => {
      const result = PasswordValidator.validate('Ab1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('rejects passwords without uppercase letters', () => {
      const result = PasswordValidator.validate('securep@ss9');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('rejects passwords without lowercase letters', () => {
      const result = PasswordValidator.validate('SECUREP@SS9');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('rejects passwords without numbers', () => {
      const result = PasswordValidator.validate('SecureP@ss');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('rejects passwords without special characters', () => {
      const result = PasswordValidator.validate('SecurePass9');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one special character (!@#$%^&* etc.)'
      );
    });

    it('rejects common passwords', () => {
      const result = PasswordValidator.validate('password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password is too common. Please choose a more secure password'
      );
    });

    it('rejects sequential characters', () => {
      const result = PasswordValidator.validate('Abcdef1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password contains sequential characters. Please use a more random pattern'
      );
    });

    it('rejects repeated characters', () => {
      const result = PasswordValidator.validate('XxxxPass9!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password contains too many repeated characters');
    });
  });

  describe('calculateStrength', () => {
    it('returns 0 for empty password', () => {
      expect(PasswordValidator.calculateStrength('')).toBe(0);
    });

    it('scores stronger passwords higher', () => {
      const weak = PasswordValidator.calculateStrength('abc');
      const strong = PasswordValidator.calculateStrength('SecureP@ss9!');
      expect(strong).toBeGreaterThan(weak);
    });
  });

  describe('getStrengthLabel', () => {
    it('returns correct labels for score ranges', () => {
      expect(PasswordValidator.getStrengthLabel(30)).toBe('Weak');
      expect(PasswordValidator.getStrengthLabel(50)).toBe('Fair');
      expect(PasswordValidator.getStrengthLabel(70)).toBe('Good');
      expect(PasswordValidator.getStrengthLabel(90)).toBe('Strong');
    });
  });

  describe('isValid', () => {
    it('returns boolean only', () => {
      expect(PasswordValidator.isValid('SecureP@ss9')).toBe(true);
      expect(PasswordValidator.isValid('weak')).toBe(false);
    });
  });
});
