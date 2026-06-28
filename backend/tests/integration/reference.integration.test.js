const { describeIfDb } = require('./helpers/db');
const { request } = require('./helpers/api');

describeIfDb('Reference API integration', () => {
  let app;

  beforeAll(() => {
    jest.resetModules();
    app = require('../../src/app');
  });

  it('GET /api/reference/nationalities returns active nationalities', async () => {
    const response = await request(app).get('/api/reference/nationalities');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/reference/document-requirements filters SA national docs', async () => {
    const response = await request(app).get('/api/reference/document-requirements?type=sa_national');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('GET /api/reference/qualifications returns programmes with modules', async () => {
    const response = await request(app).get('/api/reference/qualifications');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(Array.isArray(response.body.data[0].modules)).toBe(true);
  });

  it('GET /api/reference/home-config returns landing page stats', async () => {
    const response = await request(app).get('/api/reference/home-config');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.yearsOfExcellence).toBeGreaterThan(0);
    expect(response.body.data.display).toBeDefined();
  });
});
