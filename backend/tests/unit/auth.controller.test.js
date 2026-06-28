jest.mock('../../src/services/auth.service');
jest.mock('../../src/utils/responseHandler', () => ({
  created: jest.fn(),
  success: jest.fn(),
  badRequest: jest.fn(),
}));

const authService = require('../../src/services/auth.service');
const ResponseHandler = require('../../src/utils/responseHandler');
const authController = require('../../src/controllers/auth.controller');
const { mockRes, mockReq } = require('../helpers/mockSequelize');

describe('AuthController', () => {
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers a user successfully', async () => {
    const result = { user: { email: 'new@test.com' }, accessToken: 'token' };
    authService.register.mockResolvedValueOnce(result);
    const req = mockReq({
      body: {
        email: 'new@test.com',
        password: 'SecureP@ss9',
        first_name: 'New',
        last_name: 'User',
      },
    });
    const res = mockRes();

    await authController.register(req, res, next);

    expect(authService.register).toHaveBeenCalled();
    expect(ResponseHandler.created).toHaveBeenCalledWith(
      res,
      result,
      'User registered successfully'
    );
  });

  it('logs in a user successfully', async () => {
    const result = { user: { email: 'user@test.com' }, accessToken: 'token' };
    authService.login.mockResolvedValueOnce(result);
    const req = mockReq({ body: { email: 'user@test.com', password: 'SecureP@ss9' } });
    const res = mockRes();

    await authController.login(req, res, next);

    expect(ResponseHandler.success).toHaveBeenCalledWith(res, result, 'Login successful');
  });

  it('requires refresh token body', async () => {
    const req = mockReq({ body: {} });
    const res = mockRes();

    await authController.refreshToken(req, res, next);

    expect(ResponseHandler.badRequest).toHaveBeenCalledWith(res, 'Refresh token required');
  });

  it('returns profile for authenticated user', async () => {
    const profile = { user_id: 1, email: 'user@test.com' };
    authService.getProfile.mockResolvedValueOnce(profile);
    const req = mockReq({ user: { user_id: 1 } });
    const res = mockRes();

    await authController.getProfile(req, res, next);

    expect(authService.getProfile).toHaveBeenCalledWith(1);
    expect(ResponseHandler.success).toHaveBeenCalledWith(
      res,
      profile,
      'Profile retrieved successfully'
    );
  });

  it('logs out successfully', async () => {
    const res = mockRes();
    await authController.logout(mockReq(), res, next);
    expect(ResponseHandler.success).toHaveBeenCalledWith(res, null, 'Logout successful');
  });
});
