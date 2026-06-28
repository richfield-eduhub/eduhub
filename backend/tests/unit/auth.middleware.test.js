const jwt = require('jsonwebtoken');
const { authenticateToken, optionalAuth, authorize } = require('../../src/middleware/auth.middleware');
const { mockRes, mockReq } = require('../helpers/mockSequelize');

describe('auth.middleware', () => {
  const payload = { user_id: 1, email: 'user@test.com', role: 'student' };

  function run(middleware, req) {
    const res = mockRes();
    return new Promise((resolve) => {
      middleware(req, res, () => resolve({ res, nextCalled: true }));
      setImmediate(() => resolve({ res, nextCalled: false }));
    });
  }

  it('rejects requests without a token', async () => {
    const { res, nextCalled } = await run(authenticateToken, mockReq());
    expect(nextCalled).toBe(false);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('accepts valid bearer tokens', async () => {
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } });
    const res = mockRes();
    let nextCalled = false;

    await new Promise((resolve) => {
      authenticateToken(req, res, () => {
        nextCalled = true;
        resolve();
      });
    });

    expect(nextCalled).toBe(true);
    expect(req.user.email).toBe(payload.email);
  });

  it('rejects expired tokens', async () => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '-1s' });
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } });
    const res = mockRes();

    await new Promise((resolve) => {
      const originalStatus = res.status;
      res.status = jest.fn((code) => {
        originalStatus(code);
        resolve();
        return res;
      });
      authenticateToken(req, res, () => resolve());
    });

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Token expired' })
    );
  });

  it('optionalAuth continues without token', async () => {
    const req = mockReq();
    const res = mockRes();
    let nextCalled = false;

    await new Promise((resolve) => {
      optionalAuth(req, res, () => {
        nextCalled = true;
        resolve();
      });
    });

    expect(nextCalled).toBe(true);
    expect(req.user).toBeNull();
  });

  it('authorize denies users without required role', () => {
    const middleware = authorize(['admin']);
    const req = mockReq({ user: { role: 'student' } });
    const res = mockRes();

    middleware(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('authorize allows matching roles', () => {
    const middleware = authorize(['admin', 'lecturer']);
    const req = mockReq({ user: { role: 'lecturer' } });
    const res = mockRes();
    const next = jest.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
