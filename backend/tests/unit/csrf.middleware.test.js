const {
  csrfToken,
  verifyCsrfToken,
  generateToken,
  csrfExempt,
  conditionalCsrf,
} = require('../../src/middleware/csrf.middleware');
const { mockRes, mockReq } = require('../helpers/mockSequelize');

describe('csrf.middleware', () => {
  it('generates unique tokens', () => {
    const token1 = generateToken();
    const token2 = generateToken();
    expect(token1).toHaveLength(64);
    expect(token1).not.toBe(token2);
  });

  it('attaches CSRF token to response', () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    csrfToken(req, res, next);

    expect(res.locals.csrfToken).toBeDefined();
    expect(res.cookie).toHaveBeenCalledWith('XSRF-TOKEN', res.locals.csrfToken, expect.any(Object));
    expect(res.setHeader).toHaveBeenCalledWith('X-CSRF-Token', res.locals.csrfToken);
    expect(next).toHaveBeenCalled();
  });

  it('skips verification for safe HTTP methods', () => {
    const req = mockReq({ method: 'GET' });
    const res = mockRes();
    const next = jest.fn();

    verifyCsrfToken(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('rejects POST without CSRF token', () => {
    const req = mockReq({ method: 'POST', body: {} });
    const res = mockRes();
    const next = jest.fn();

    verifyCsrfToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('verifies matching header and cookie tokens', () => {
    const setupReq = mockReq();
    const setupRes = mockRes();
    csrfToken(setupReq, setupRes, jest.fn());
    const token = setupRes.locals.csrfToken;

    const req = mockReq({
      method: 'POST',
      headers: {
        'x-csrf-token': token,
        origin: 'http://localhost:3000',
      },
      cookies: { 'XSRF-TOKEN': token },
      body: {},
    });
    const res = mockRes();
    const next = jest.fn();

    verifyCsrfToken(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('conditionalCsrf skips exempt routes', () => {
    const req = mockReq({ method: 'POST' });
    csrfExempt(req, mockRes(), jest.fn());

    const res = mockRes();
    const next = jest.fn();
    conditionalCsrf(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
