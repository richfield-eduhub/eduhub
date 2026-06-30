const securityHeaders = require('../../src/middleware/securityHeaders.middleware');
const { mockRes, mockReq } = require('../helpers/mockSequelize');

describe('securityHeaders.middleware', () => {
  it('sets standard security headers', () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    securityHeaders(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    expect(res.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Security-Policy',
      expect.stringContaining("default-src 'self'")
    );
    expect(next).toHaveBeenCalled();
  });

  it('does not set HSTS outside production', () => {
    const req = mockReq();
    const res = mockRes();

    securityHeaders(req, res, jest.fn());

    const hstsCalls = res.setHeader.mock.calls.filter(([header]) => header === 'Strict-Transport-Security');
    expect(hstsCalls).toHaveLength(0);
  });
});
