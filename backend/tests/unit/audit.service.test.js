const { createMockSequelize } = require('../helpers/mockSequelize');

const mockSequelize = createMockSequelize();
jest.mock('../../src/config/database', () => mockSequelize);
jest.mock('uuid', () => ({ v4: () => 'audit-log-uuid-1' }));

const AuditService = require('../../src/services/audit.service');

describe('AuditService', () => {
  beforeEach(() => mockSequelize.reset());

  it('creates an audit log entry', async () => {
    mockSequelize.query.mockResolvedValueOnce([]);

    const result = await AuditService.log({
      userId: 1,
      action: 'LOGIN_SUCCESS',
      ipAddress: '127.0.0.1',
    });

    expect(result.action).toBe('LOGIN_SUCCESS');
    expect(mockSequelize.query).toHaveBeenCalled();
  });

  it('does not throw when logging fails', async () => {
    mockSequelize.query.mockRejectedValueOnce(new Error('DB down'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await AuditService.log({ action: 'TEST' });
    expect(result).toBeNull();

    consoleSpy.mockRestore();
  });

  it('logs login events', async () => {
    mockSequelize.query.mockResolvedValueOnce([]);
    const result = await AuditService.logLogin(5, '10.0.0.1', 'Jest', true);
    expect(result.action).toBe('LOGIN_SUCCESS');
  });

  it('logs application approval actions', async () => {
    mockSequelize.query.mockResolvedValueOnce([]);
    const result = await AuditService.logApplicationAction(2, 'app-1', 'approve', 'pending', 'approved');
    expect(result.action).toBe('APPLICATION_APPROVE');
  });

  it('returns paginated audit logs', async () => {
    mockSequelize.query
      .mockResolvedValueOnce([{ total: '5' }])
      .mockResolvedValueOnce([{ id: 'log-1', action: 'LOGIN_SUCCESS' }]);

    const result = await AuditService.getAuditLogs({ limit: 10, offset: 0 });
    expect(result.total).toBe(5);
    expect(result.logs).toHaveLength(1);
    expect(result.hasMore).toBe(true);
  });

  it('returns audit statistics', async () => {
    mockSequelize.query.mockResolvedValueOnce([{
      total_events: '10',
      unique_users: '3',
      login_events: '4',
    }]);

    const stats = await AuditService.getAuditStats();
    expect(stats.total_events).toBe('10');
  });
});
