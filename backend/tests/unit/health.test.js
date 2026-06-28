const request = require('supertest');
const app = require('../../src/app');

describe('GET /api/health', () => {
  it('returns ok status with uptime and environment', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();
    expect(typeof response.body.uptime).toBe('number');
    expect(response.body.environment).toBe('test');
  });
});

describe('GET /api/csrf-token', () => {
  it('returns a CSRF token', async () => {
    const response = await request(app).get('/api/csrf-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.csrfToken).toBeDefined();
  });
});
