function createMockSequelize() {
  const mockTransaction = {
    commit: jest.fn().mockResolvedValue(undefined),
    rollback: jest.fn().mockResolvedValue(undefined),
  };

  const mock = {
    transaction: jest.fn().mockResolvedValue(mockTransaction),
    query: jest.fn(),
    QueryTypes: { SELECT: 'SELECT', INSERT: 'INSERT', UPDATE: 'UPDATE', DELETE: 'DELETE' },
    mockTransaction,
    reset() {
      jest.clearAllMocks();
      mock.transaction.mockResolvedValue(mockTransaction);
      mock.query.mockReset();
    },
  };

  return mock;
}

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.locals = {};
  return res;
}

function mockReq(overrides = {}) {
  return {
    body: {},
    query: {},
    params: {},
    headers: {},
    cookies: {},
    method: 'GET',
    ip: '127.0.0.1',
    connection: { remoteAddress: '127.0.0.1' },
    socket: { remoteAddress: '127.0.0.1' },
    ...overrides,
  };
}

module.exports = { createMockSequelize, mockRes, mockReq };
