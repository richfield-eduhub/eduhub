const {
  auditAction,
  setAuditMetadata,
  captureOldData,
  getClientIp,
  getUserAgent,
} = require('../../src/middleware/audit.middleware');
const AuditService = require('../../src/services/audit.service');
const { mockRes, mockReq } = require('../helpers/mockSequelize');

jest.mock('../../src/services/audit.service', () => ({
  log: jest.fn().mockResolvedValue({ id: 'audit-1' }),
}));

describe('audit.middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('extracts client IP from forwarded header', () => {
    const req = mockReq({
      headers: { 'x-forwarded-for': '203.0.113.1, 10.0.0.1' },
    });
    expect(getClientIp(req)).toBe('203.0.113.1');
  });

  it('extracts user agent', () => {
    const req = mockReq({ headers: { 'user-agent': 'Jest Test Agent' } });
    expect(getUserAgent(req)).toBe('Jest Test Agent');
  });

  it('sets audit metadata on request', () => {
    const middleware = setAuditMetadata('users', 'id');
    const req = mockReq({ params: { id: '42' } });

    middleware(req, mockRes(), jest.fn());

    expect(req.auditTableName).toBe('users');
    expect(req.auditRecordId).toBe('42');
  });

  it('captures old data before updates', async () => {
    const middleware = captureOldData(async () => ({ name: 'Old Name' }));
    const req = mockReq();

    await new Promise((resolve) => middleware(req, mockRes(), resolve));

    expect(req.auditOldData).toEqual({ name: 'Old Name' });
  });

  it('logs successful actions via AuditService', async () => {
    const middleware = auditAction('USER_UPDATE');
    const req = mockReq({ user: { user_id: 5 } });
    const res = mockRes();
    res.statusCode = 200;

    await new Promise((resolve) => middleware(req, res, resolve));

    const response = { id: 99, email: 'updated@test.com' };
    await res.json(response);

    expect(AuditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 5,
        action: 'USER_UPDATE',
        recordId: 99,
      })
    );
  });
});
