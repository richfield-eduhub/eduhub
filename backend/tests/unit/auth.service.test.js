const jwt = require('jsonwebtoken');

const mockTransaction = {
  commit: jest.fn().mockResolvedValue(undefined),
  rollback: jest.fn().mockResolvedValue(undefined),
};

const mockSequelize = {
  transaction: jest.fn().mockResolvedValue(mockTransaction),
  query: jest.fn(),
  QueryTypes: { SELECT: 'SELECT' },
};

jest.mock('../../src/config/database', () => mockSequelize);
jest.mock('../../src/services/email.service', () => ({
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

const authService = require('../../src/services/auth.service');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.query.mockReset();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
  });

  describe('generateTokens', () => {
    it('returns access and refresh tokens with expiry', () => {
      const payload = { user_id: 1, email: 'test@eduhub.ac.za', role: 'student' };
      const tokens = authService.generateTokens(payload);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.expiresIn).toBe('7d');

      const decoded = jwt.verify(tokens.accessToken, process.env.JWT_SECRET);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.user_id).toBe(payload.user_id);
    });
  });

  describe('refreshToken', () => {
    it('generates new tokens from a valid refresh token', async () => {
      const payload = { user_id: 2, email: 'user@eduhub.ac.za', role: 'admin' };
      const { refreshToken } = authService.generateTokens(payload);

      const tokens = await authService.refreshToken(refreshToken);
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
    });

    it('rejects invalid refresh tokens', async () => {
      await expect(authService.refreshToken('not-a-valid-token')).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid or expired refresh token',
      });
    });
  });

  describe('register', () => {
    it('rejects weak passwords before hitting the database', async () => {
      await expect(
        authService.register({
          email: 'new@eduhub.ac.za',
          password: 'weak',
          first_name: 'Test',
          last_name: 'User',
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'Password does not meet security requirements',
      });

      expect(mockSequelize.query).not.toHaveBeenCalled();
    });

    it('rejects duplicate email addresses', async () => {
      mockSequelize.query.mockResolvedValueOnce([{ id: 99 }]);

      await expect(
        authService.register({
          email: 'exists@eduhub.ac.za',
          password: 'SecureP@ss9',
          first_name: 'Test',
          last_name: 'User',
        })
      ).rejects.toMatchObject({
        statusCode: 409,
        message: 'Email already registered',
      });

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('creates user and returns tokens for valid registration', async () => {
      mockSequelize.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([[{
          user_id: 10,
          email: 'newuser@eduhub.ac.za',
          role: 'student',
          account_status: 'active',
          created_at: new Date(),
        }]])
        .mockResolvedValueOnce([[]]);

      const result = await authService.register({
        email: 'newuser@eduhub.ac.za',
        password: 'SecureP@ss9',
        first_name: 'New',
        last_name: 'User',
      });

      expect(result.user.email).toBe('newuser@eduhub.ac.za');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockTransaction.commit).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('rejects unknown email with generic error', async () => {
      mockSequelize.query.mockResolvedValueOnce([]);

      await expect(
        authService.login({ email: 'missing@eduhub.ac.za', password: 'SecureP@ss9' })
      ).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid email or password',
      });
    });

    it('rejects incorrect password', async () => {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('CorrectP@ss1', 4);

      mockSequelize.query
        .mockResolvedValueOnce([{
          user_id: 5,
          email: 'user@eduhub.ac.za',
          password_hash: hash,
          role: 'student',
          account_status: 'active',
          failed_login_attempts: 0,
          last_failed_login: null,
          mfa_enabled: false,
          first_name: 'Test',
          last_name: 'User',
        }])
        .mockResolvedValueOnce([]);

      await expect(
        authService.login({ email: 'user@eduhub.ac.za', password: 'WrongP@ss1' })
      ).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it('returns tokens for valid credentials', async () => {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('ValidP@ss9', 4);

      mockSequelize.query
        .mockResolvedValueOnce([{
          user_id: 7,
          email: 'valid@eduhub.ac.za',
          password_hash: hash,
          role: 'student',
          account_status: 'active',
          failed_login_attempts: 0,
          last_failed_login: null,
          mfa_enabled: false,
          is_default_password: false,
          require_password_change: false,
          first_name: 'Valid',
          last_name: 'User',
        }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await authService.login({
        email: 'valid@eduhub.ac.za',
        password: 'ValidP@ss9',
      });

      expect(result.user.email).toBe('valid@eduhub.ac.za');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('rejects inactive accounts', async () => {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('ValidP@ss9', 4);

      mockSequelize.query.mockResolvedValueOnce([{
        user_id: 8,
        email: 'inactive@eduhub.ac.za',
        password_hash: hash,
        role: 'student',
        account_status: 'suspended',
        failed_login_attempts: 0,
        last_failed_login: null,
        mfa_enabled: false,
      }]);

      await expect(
        authService.login({ email: 'inactive@eduhub.ac.za', password: 'ValidP@ss9' })
      ).rejects.toMatchObject({
        statusCode: 403,
      });
    });
  });
});
