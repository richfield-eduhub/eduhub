const { describeIfDb } = require('./helpers/db');
const { request, authHeader, loginAs } = require('./helpers/api');

describeIfDb('Admin API integration', () => {
  let app;

  beforeAll(() => {
    jest.resetModules();
    app = require('../../src/app');
  });

  it('admin can list semesters', async () => {
    const { accessToken } = await loginAs(app, 'admin');

    const response = await request(app)
      .get('/api/admin/semesters')
      .set(authHeader(accessToken));

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('lecturer can fetch own modules', async () => {
    const { accessToken } = await loginAs(app, 'lecturer');

    const response = await request(app)
      .get('/api/lecturers/me/modules')
      .set(authHeader(accessToken));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
