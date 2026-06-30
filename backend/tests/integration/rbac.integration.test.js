const { describeIfDb } = require('./helpers/db');
const { request, authHeader, loginAs } = require('./helpers/api');

describeIfDb('RBAC integration', () => {
  let app;

  beforeAll(() => {
    jest.resetModules();
    app = require('../../src/app');
  });

  it('blocks unauthenticated access to protected routes', async () => {
    const response = await request(app).get('/api/students/me');
    expect(response.status).toBe(401);
  });

  it('blocks students from admin endpoints', async () => {
    const { accessToken } = await loginAs(app, 'student');

    const response = await request(app)
      .get('/api/admin/lecturers')
      .set(authHeader(accessToken));

    expect(response.status).toBe(403);
  });

  it('allows admin to access admin endpoints', async () => {
    const { accessToken } = await loginAs(app, 'admin');

    const response = await request(app)
      .get('/api/admin/lecturers')
      .set(authHeader(accessToken));

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('allows staff to list students', async () => {
    const { accessToken } = await loginAs(app, 'lecturer');

    const response = await request(app)
      .get('/api/students')
      .set(authHeader(accessToken));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('blocks students from listing all students', async () => {
    const { accessToken } = await loginAs(app, 'student');

    const response = await request(app)
      .get('/api/students')
      .set(authHeader(accessToken));

    expect(response.status).toBe(403);
  });
});
