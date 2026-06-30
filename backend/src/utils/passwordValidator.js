/**
 * Password Validation Utility
 *
 * Enforces password strength requirements as per design specification (Page 43-44)
 *
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character (recommended)
 * - Not in common passwords list
 */

// Common passwords list (subset - in production, use a comprehensive list)
const COMMON_PASSWORDS = [
  'password', 'password123', '12345678', 'qwerty', 'abc123',
  'monkey', '1234567890', 'letmein', 'trustno1', 'dragon',
  'baseball', 'iloveyou', 'master', 'sunshine', 'ashley',
  'bailey', 'passw0rd', 'shadow', '123123', '654321',
  'superman', 'qazwsx', 'michael', 'football', 'welcome',
  'jesus', 'ninja', 'mustang', 'password1', '123456789',
];

class PasswordValidator {
  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} - { isValid: boolean, errors: string[] }
   */
  static validate(password) {
    const errors = [];

    // Check minimum length
    if (!password || password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Check for number
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // Check for special character (recommended but enforced)
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&* etc.)');
    }

    // Check against common passwords
    if (password && COMMON_PASSWORDS.includes(password.toLowerCase())) {
      errors.push('Password is too common. Please choose a more secure password');
    }

    // Check for sequential characters (123, abc, etc.)
    if (this.hasSequentialCharacters(password)) {
      errors.push('Password contains sequential characters. Please use a more random pattern');
    }

    // Check for repeated characters (aaa, 111, etc.)
    if (this.hasRepeatedCharacters(password)) {
      errors.push('Password contains too many repeated characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength: this.calculateStrength(password),
    };
  }

  /**
   * Check for sequential characters (123, abc, etc.)
   */
  static hasSequentialCharacters(password) {
    if (!password || password.length < 3) return false;

    for (let i = 0; i < password.length - 2; i++) {
      const char1 = password.charCodeAt(i);
      const char2 = password.charCodeAt(i + 1);
      const char3 = password.charCodeAt(i + 2);

      // Check for ascending sequence (e.g., 123, abc)
      if (char2 === char1 + 1 && char3 === char2 + 1) {
        return true;
      }

      // Check for descending sequence (e.g., 321, cba)
      if (char2 === char1 - 1 && char3 === char2 - 1) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check for repeated characters (more than 2 in a row)
   */
  static hasRepeatedCharacters(password) {
    if (!password) return false;
    return /(.)\1{2,}/.test(password);
  }

  /**
   * Calculate password strength score (0-100)
   */
  static calculateStrength(password) {
    if (!password) return 0;

    let score = 0;

    // Length score (max 30 points)
    score += Math.min(password.length * 2, 30);

    // Character variety score (max 40 points)
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/\d/.test(password)) score += 10;
    if (/[^a-zA-Z0-9]/.test(password)) score += 10;

    // Complexity score (max 30 points)
    const uniqueChars = new Set(password).size;
    score += Math.min(uniqueChars * 2, 20);

    // Bonus for length > 12
    if (password.length > 12) score += 10;

    // Penalty for common patterns
    if (this.hasSequentialCharacters(password)) score -= 10;
    if (this.hasRepeatedCharacters(password)) score -= 10;
    if (COMMON_PASSWORDS.includes(password.toLowerCase())) score -= 30;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get strength label
   */
  static getStrengthLabel(score) {
    if (score < 40) return 'Weak';
    if (score < 60) return 'Fair';
    if (score < 80) return 'Good';
    return 'Strong';
  }

  /**
   * Quick validation method (returns boolean only)
   */
  static isValid(password) {
    return this.validate(password).isValid;
  }
}

module.exports = PasswordValidator;
