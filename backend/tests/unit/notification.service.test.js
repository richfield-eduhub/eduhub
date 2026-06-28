const { createMockSequelize } = require('../helpers/mockSequelize');

const mockSequelize = createMockSequelize();
jest.mock('../../src/config/database', () => mockSequelize);
jest.mock('uuid', () => ({ v4: () => 'notification-uuid-1' }));

const notificationService = require('../../src/services/notification.service');

describe('NotificationService', () => {
  beforeEach(() => mockSequelize.reset());

  it('rejects invalid notification types', async () => {
    await expect(
      notificationService.createNotification({
        userId: 1,
        title: 'Test',
        message: 'Hello',
        type: 'invalid',
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('creates a notification', async () => {
    mockSequelize.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{
        id: 'notification-uuid-1',
        user_id: 1,
        title: 'Welcome',
        message: 'Hello',
        type: 'info',
        is_read: false,
      }]);

    const result = await notificationService.createNotification({
      userId: 1,
      title: 'Welcome',
      message: 'Hello',
      type: 'success',
    });

    expect(result.title).toBe('Welcome');
    expect(mockSequelize.query).toHaveBeenCalled();
  });

  it('returns user notifications with unread count', async () => {
    mockSequelize.query
      .mockResolvedValueOnce([{ id: 'n1', title: 'Alert' }])
      .mockResolvedValueOnce([{ unread_count: 2 }]);

    const result = await notificationService.getUserNotifications(1);
    expect(result.notifications).toHaveLength(1);
    expect(result.unread).toBe(2);
  });

  it('marks notification as read', async () => {
    mockSequelize.query
      .mockResolvedValueOnce([{ id: 'n1', user_id: 1 }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'n1', is_read: true }]);

    const result = await notificationService.markAsRead('n1', 1);
    expect(result.is_read).toBe(true);
  });

  it('throws when notification does not belong to user', async () => {
    mockSequelize.query.mockResolvedValueOnce([]);

    await expect(notificationService.markAsRead('n1', 99)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
