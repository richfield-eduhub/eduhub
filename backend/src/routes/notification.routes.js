/**
 * Notification Routes — persistent database storage
 * Frontend uses these for the notification bell.
 */
const express = require('express');
const router  = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const notificationService = require('../services/notification.service');
const ResponseHandler = require('../utils/responseHandler');

router.use(authenticateToken);

// GET /api/notifications - Get user's notifications
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { limit, offset, unreadOnly } = req.query;

    const result = await notificationService.getUserNotifications(userId, {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      unreadOnly: unreadOnly === 'true',
    });

    res.json({
      ok: true,
      notifications: result.notifications,
      unread: result.unread,
      total: result.total,
    });
  } catch (err) { next(err); }
});

// PUT /api/notifications/:id/read - Mark as read
router.put('/:id/read', async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const notificationId = req.params.id;

    const notification = await notificationService.markAsRead(notificationId, userId);

    res.json({
      ok: true,
      message: 'Marked as read.',
      notification,
    });
  } catch (err) { next(err); }
});

// POST /api/notifications/mark-all-read - Mark all as read
router.post('/mark-all-read', async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const result = await notificationService.markAllAsRead(userId);

    res.json({
      ok: true,
      message: result.message,
    });
  } catch (err) { next(err); }
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const notificationId = req.params.id;

    const result = await notificationService.deleteNotification(notificationId, userId);

    res.json({
      ok: true,
      message: result.message,
    });
  } catch (err) { next(err); }
});

// DELETE /api/notifications/read - Delete all read notifications
router.delete('/read/all', async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const result = await notificationService.deleteAllRead(userId);

    res.json({
      ok: true,
      message: result.message,
      count: result.count,
    });
  } catch (err) { next(err); }
});

// Export the push helper so other services can create notifications
router.pushNotif = async function(userId, title, message, type = 'info') {
  try {
    await notificationService.pushNotification(userId, title, message, type);
  } catch (error) {
    console.error('[NotificationRoutes] Failed to push notification:', error.message);
  }
};

module.exports = router;
