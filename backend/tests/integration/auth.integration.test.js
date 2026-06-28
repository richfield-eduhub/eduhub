const { describeIfDb } = require('./helpers/db');
const { request, authHeader, loginAs, uniqueEmail, SEEDED } = require('./helpers/api');

describeIfDb('Auth API integration', () => {
  let app;

  beforeAll(() => {
    jest.resetModules();
    app = require('../../src/app');
  });

  it('logs in with seeded admin credentials', async () => {
    const { response, accessToken, user } = await loginAs(app, 'admin');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(accessToken).toBeDefined();
    expect(user.role).toBe('admin');
  });

  it('rejects invalid login credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: SEEDED.admin.email, password: 'WrongP@ss9!' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('registers a new user and returns tokens', async () => {
    const email = uniqueEmail('register');
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email,
        password: 'SecureP@ss9',
        first_name: 'Integration',
        last_name: 'Tester',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.user.email).toBe(email);
  });

  it('rejects duplicate registration', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: SEEDED.admin.email,
        password: 'SecureP@ss9',
        first_name: 'Duplicate',
        last_name: 'User',
      });

    expect(response.status).toBe(409);
  });

  it('returns profile for authenticated user', async () => {
    const { accessToken } = await loginAs(app, 'student');

    const response = await request(app)
      .get('/api/auth/profile')
      .set(authHeader(accessToken));

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe(SEEDED.student.email);
  });

  it('refreshes access token', async () => {
    const { refreshToken } = await loginAs(app, 'admin');

    const response = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();
  });

  it('rejects unauthenticated profile access', async () => {
    const response = await request(app).get('/api/auth/profile');
    expect(response.status).toBe(401);
  });
});
