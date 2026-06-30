/**
 * Notification Service
 *
 * Handles persistent in-app notifications
 * Replaces the in-memory notification store
 */

const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class NotificationService {
  /**
   * Create a notification for a user
   */
  async createNotification({ userId, title, message, type = 'info' }) {
    const validTypes = ['info', 'success', 'warning', 'error'];
    if (!validTypes.includes(type)) {
      throw { statusCode: 400, message: `Type must be one of: ${validTypes.join(', ')}` };
    }

    const notificationId = uuidv4();

    await sequelize.query(
      `INSERT INTO notifications (
         id, user_id, title, message, type, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      {
        replacements: [notificationId, userId, title, message, type],
      }
    );

    return await this.getNotificationById(notificationId);
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(notificationId) {
    const [notification] = await sequelize.query(
      `SELECT
         id,
         user_id,
         title,
         message,
         type,
         is_read,
         read_at,
         created_at,
         updated_at
       FROM notifications
       WHERE id = ?`,
      {
        replacements: [notificationId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!notification) {
      throw { statusCode: 404, message: 'Notification not found' };
    }

    return notification;
  }

  /**
   * Get all notifications for a user
   */
  async getUserNotifications(userId, { limit = 50, offset = 0, unreadOnly = false } = {}) {
    let whereClause = 'WHERE user_id = ?';
    const replacements = [userId];

    if (unreadOnly) {
      whereClause += ' AND is_read = false';
    }

    const notifications = await sequelize.query(
      `SELECT
         id,
         user_id,
         title,
         message,
         type,
         is_read,
         read_at,
         created_at,
         updated_at
       FROM notifications
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      {
        replacements: [...replacements, limit, offset],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Get unread count
    const [countResult] = await sequelize.query(
      `SELECT COUNT(*)::int AS unread_count
       FROM notifications
       WHERE user_id = ? AND is_read = false`,
      {
        replacements: [userId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return {
      notifications,
      unread: countResult.unread_count,
      total: notifications.length,
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    // Verify notification belongs to user
    const [notification] = await sequelize.query(
      `SELECT id, user_id FROM notifications WHERE id = ? AND user_id = ?`,
      {
        replacements: [notificationId, userId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!notification) {
      throw { statusCode: 404, message: 'Notification not found' };
    }

    await sequelize.query(
      `UPDATE notifications
       SET is_read = true,
           read_at = NOW(),
           updated_at = NOW()
       WHERE id = ?`,
      {
        replacements: [notificationId],
      }
    );

    return await this.getNotificationById(notificationId);
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    await sequelize.query(
      `UPDATE notifications
       SET is_read = true,
           read_at = NOW(),
           updated_at = NOW()
       WHERE user_id = ? AND is_read = false`,
      {
        replacements: [userId],
      }
    );

    return { success: true, message: 'All notifications marked as read' };
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId, userId) {
    // Verify notification belongs to user
    const [notification] = await sequelize.query(
      `SELECT id FROM notifications WHERE id = ? AND user_id = ?`,
      {
        replacements: [notificationId, userId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!notification) {
      throw { statusCode: 404, message: 'Notification not found' };
    }

    await sequelize.query(
      `DELETE FROM notifications WHERE id = ?`,
      {
        replacements: [notificationId],
      }
    );

    return { success: true, message: 'Notification deleted successfully' };
  }

  /**
   * Delete all read notifications for a user
   */
  async deleteAllRead(userId) {
    const [result] = await sequelize.query(
      `DELETE FROM notifications
       WHERE user_id = ? AND is_read = true
       RETURNING id`,
      {
        replacements: [userId],
      }
    );

    const count = result.length;
    return { success: true, message: `${count} notification(s) deleted`, count };
  }

  /**
   * Helper: Push notification (for backward compatibility)
   */
  async pushNotification(userId, title, message, type = 'info') {
    return await this.createNotification({ userId, title, message, type });
  }
}

module.exports = new NotificationService();
