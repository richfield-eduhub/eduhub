const { describeIfDb } = require('./helpers/db');
const { request } = require('./helpers/api');

describeIfDb('Public API integration', () => {
  let app;

  beforeAll(() => {
    jest.resetModules();
    app = require('../../src/app');
  });

  it('GET /api/qualifications returns seeded programmes', async () => {
    const response = await request(app).get('/api/qualifications');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/campuses returns campus list', async () => {
    const response = await request(app).get('/api/campuses');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('GET /api/campuses/by-province groups campuses', async () => {
    const response = await request(app).get('/api/campuses/by-province');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('GET /api/modules returns module catalogue', async () => {
    const response = await request(app).get('/api/modules');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/qualifications/:id returns modules for a programme', async () => {
    const list = await request(app).get('/api/qualifications');
    const qualificationId = list.body.data[0].id;

    const response = await request(app).get(`/api/qualifications/${qualificationId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(qualificationId);
    expect(Array.isArray(response.body.data.modules)).toBe(true);
  });
});
