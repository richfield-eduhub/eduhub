const {
  checkRole,
  adminOnly,
  checkOwnership,
  ownerOrStaff,
} = require('../../src/middleware/roleCheck.middleware');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function runMiddleware(middleware, req) {
  return new Promise((resolve) => {
    const res = mockRes();
    let nextCalled = false;
    middleware(req, res, () => {
      nextCalled = true;
    });
    resolve({ nextCalled, res });
  });
}

describe('roleCheck middleware', () => {
  it('blocks unauthenticated users', async () => {
    const middleware = checkRole(['admin']);
    const { nextCalled, res } = await runMiddleware(middleware, {});

    expect(nextCalled).toBe(false);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('allows users with required role', async () => {
    const middleware = checkRole(['admin', 'lecturer']);
    const { nextCalled } = await runMiddleware(middleware, {
      user: { role: 'lecturer', user_id: 1 },
    });

    expect(nextCalled).toBe(true);
  });

  it('denies users without required role', async () => {
    const middleware = adminOnly;
    const { nextCalled, res } = await runMiddleware(middleware, {
      user: { role: 'student', user_id: 2 },
    });

    expect(nextCalled).toBe(false);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('allows admin to access any owned resource', async () => {
    const { nextCalled } = await runMiddleware(checkOwnership, {
      user: { role: 'admin', user_id: 1 },
      params: { id: '999' },
    });

    expect(nextCalled).toBe(true);
  });

  it('allows users to access their own resource', async () => {
    const { nextCalled } = await runMiddleware(checkOwnership, {
      user: { role: 'student', user_id: '42' },
      params: { id: '42' },
    });

    expect(nextCalled).toBe(true);
  });

  it('denies users from accessing another user resource', async () => {
    const { nextCalled, res } = await runMiddleware(checkOwnership, {
      user: { role: 'student', user_id: '42' },
      params: { id: '99' },
    });

    expect(nextCalled).toBe(false);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('allows staff to access resources via ownerOrStaff', async () => {
    const { nextCalled } = await runMiddleware(ownerOrStaff, {
      user: { role: 'lecturer', user_id: 3 },
      params: { userId: '99' },
    });

    expect(nextCalled).toBe(true);
  });
});
