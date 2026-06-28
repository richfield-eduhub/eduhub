const request = require('supertest');

const SEEDED = {
  admin: { email: 'admin@eduhub.ac.za', password: 'Password123!' },
  lecturer: { email: 'john.smith@eduhub.ac.za', password: 'Password123!' },
  student: { email: 'thabo.molefe@student.eduhub.ac.za', password: 'Password123!' },
};

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

async function login(app, { email, password }) {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  return response;
}

async function loginAs(app, role) {
  const credentials = SEEDED[role];
  if (!credentials) {
    throw new Error(`Unknown seeded role: ${role}`);
  }

  const response = await login(app, credentials);
  const payload = response.body.data || response.body;

  return {
    response,
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    user: payload.user,
  };
}

function uniqueEmail(prefix = 'integration') {
  return `${prefix}.${Date.now()}@integration.test`;
}

module.exports = {
  request,
  SEEDED,
  authHeader,
  login,
  loginAs,
  uniqueEmail,
};
