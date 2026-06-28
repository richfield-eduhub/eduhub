const { rateLimit, strictRateLimit } = require('../../src/middleware/rateLimit.middleware');
const { mockRes, mockReq } = require('../helpers/mockSequelize');

describe('rateLimit.middleware', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    delete process.env.DISABLE_RATE_LIMIT;
  });

  it('allows requests under the limit', () => {
    process.env.NODE_ENV = 'test';
    const middleware = rateLimit(5, 60000, 'test-bucket');
    const req = mockReq({ ip: '10.0.0.1' });
    const res = mockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 5);
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 4);
  });

  it('blocks requests over the limit', () => {
    process.env.NODE_ENV = 'test';
    const middleware = rateLimit(2, 60000, 'test-block');
    const req = mockReq({ ip: '10.0.0.2' });
    const next = jest.fn();

    middleware(req, mockRes(), next);
    middleware(req, mockRes(), next);
    const res = mockRes();
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(429);
  });

  it('skips rate limiting when disabled in development', () => {
    process.env.NODE_ENV = 'development';
    process.env.DISABLE_RATE_LIMIT = 'true';
    const middleware = rateLimit(1, 60000, 'dev-skip');
    const next = jest.fn();

    middleware(mockReq(), mockRes(), next);
    middleware(mockReq(), mockRes(), next);

    expect(next).toHaveBeenCalledTimes(2);
  });

  it('uses a separate namespace for strict auth limiter', () => {
    process.env.NODE_ENV = 'test';
    const globalLimiter = rateLimit(1, 60000, 'global-ns');
    const authLimiter = strictRateLimit(5, 60000);
    const req = mockReq({ ip: '10.0.0.3' });
    const next = jest.fn();

    globalLimiter(req, mockRes(), next);
    authLimiter(req, mockRes(), next);

    expect(next).toHaveBeenCalledTimes(2);
  });
});
