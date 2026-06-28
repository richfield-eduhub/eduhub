const { describeIfDb } = require('./helpers/db');
const { request, authHeader, loginAs } = require('./helpers/api');

describeIfDb('Students API integration', () => {
  let app;
  let studentSession;

  beforeAll(async () => {
    jest.resetModules();
    app = require('../../src/app');
    studentSession = await loginAs(app, 'student');
  });

  it('GET /api/students/me returns the logged-in student profile', async () => {
    const response = await request(app)
      .get('/api/students/me')
      .set(authHeader(studentSession.accessToken));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });

  it('admin can list students with pagination metadata', async () => {
    const { accessToken } = await loginAs(app, 'admin');

    const response = await request(app)
      .get('/api/students?page=1&limit=10')
      .set(authHeader(accessToken));

    expect(response.status).toBe(200);
    expect(response.body.pagination).toBeDefined();
    expect(response.body.pagination.page).toBe(1);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
