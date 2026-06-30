/**
 * Messages Routes — /api/messages/*
 * Handles messaging between students, lecturers, and admins
 */
const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/roleCheck.middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validator.middleware');
const ResponseHandler = require('../utils/responseHandler');

router.use(authenticateToken);

/**
 * GET /api/messages
 * Get all messages for the current user (inbox)
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const userRole = req.user.role;

    // Get messages where:
    // 1. User is the recipient (direct message)
    // 2. User's role matches a broadcast message
    const messages = await sequelize.query(
      `SELECT
        id, sender_id, sender_role, recipient_id, recipient_role,
        subject, body, is_broadcast, is_read, read_at,
        attachments, created_at, updated_at,
        sender_email, sender_first_name, sender_last_name,
        recipient_email, recipient_first_name, recipient_last_name
      FROM messages_with_users
      WHERE
        (recipient_id = ? AND is_broadcast = FALSE)
        OR (is_broadcast = TRUE AND (recipient_role = ? OR recipient_role = 'all'))
      ORDER BY created_at DESC`,
      {
        replacements: [userId, userRole],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json({
      ok: true,
      messages,
      total: messages.length,
      unread: messages.filter(m => !m.is_read).length,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/messages/sent
 * Get all messages sent by the current user
 */
router.get('/sent', async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const messages = await sequelize.query(
      `SELECT
        id, sender_id, sender_role, recipient_id, recipient_role,
        subject, body, is_broadcast, is_read, read_at,
        attachments, created_at, updated_at,
        sender_email, sender_first_name, sender_last_name,
        recipient_email, recipient_first_name, recipient_last_name
      FROM messages_with_users
      WHERE sender_id = ?
      ORDER BY created_at DESC`,
      {
        replacements: [userId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json({
      ok: true,
      messages,
      total: messages.length,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/messages/lecturers
 * Get list of lecturers for students to message
 */
router.get('/lecturers', async (req, res, next) => {
  try {
    const lecturers = await sequelize.query(
      `SELECT
        u.id, u.email,
        ud.first_name, ud.last_name,
        l.employee_number, l.department
      FROM users u
      JOIN user_details ud ON u.id = ud.user_id
      JOIN lecturers l ON u.id = l.user_id
      WHERE u.role = 'lecturer' AND u.account_status = 'active'
      ORDER BY ud.last_name, ud.first_name`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json({
      ok: true,
      lecturers,
      total: lecturers.length,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/messages/:id
 * Get a specific message and mark it as read
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const userRole = req.user.role;

    const messages = await sequelize.query(
      `SELECT
        id, sender_id, sender_role, recipient_id, recipient_role,
        subject, body, is_broadcast, is_read, read_at,
        attachments, created_at, updated_at,
        sender_email, sender_first_name, sender_last_name,
        recipient_email, recipient_first_name, recipient_last_name
      FROM messages_with_users
      WHERE id = ?`,
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const message = messages[0];
    if (!message) {
      return ResponseHandler.notFound(res, 'Message not found');
    }

    // Check if user has access to this message
    const hasAccess =
      message.sender_id === userId ||
      message.recipient_id === userId ||
      (message.is_broadcast &&
        (message.recipient_role === userRole || message.recipient_role === 'all'));

    if (!hasAccess) {
      return ResponseHandler.forbidden(res, 'You do not have access to this message');
    }

    // Mark as read if user is the recipient
    if (message.recipient_id === userId && !message.is_read) {
      await sequelize.query(
        `UPDATE messages SET is_read = TRUE, read_at = NOW(), updated_at = NOW() WHERE id = ?`,
        { replacements: [id] }
      );
      message.is_read = true;
      message.read_at = new Date();
    }

    res.json({ ok: true, message });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/messages
 * Send a new message
 */
router.post(
  '/',
  [
    body('subject').notEmpty().withMessage('Subject is required').trim(),
    body('body').notEmpty().withMessage('Message body is required').trim(),
    body('recipientId')
      .optional()
      .isUUID()
      .withMessage('Recipient ID must be a valid UUID'),
    body('recipientRole')
      .optional()
      .isIn(['student', 'lecturer', 'all'])
      .withMessage('Recipient role must be student, lecturer, or all'),
    body('isBroadcast').optional().isBoolean().withMessage('isBroadcast must be boolean'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { subject, body, recipientId, recipientRole, isBroadcast } = req.body;
      const senderId = req.user.user_id;
      const senderRole = req.user.role;

      // Validate based on sender role and message type
      if (isBroadcast) {
        // Only admins can send broadcast messages
        if (senderRole !== 'admin') {
          return ResponseHandler.forbidden(
            res,
            'Only administrators can send broadcast messages'
          );
        }

        if (!recipientRole) {
          return ResponseHandler.badRequest(
            res,
            'Recipient role is required for broadcast messages'
          );
        }

        if (recipientId) {
          return ResponseHandler.badRequest(
            res,
            'Broadcast messages cannot have a specific recipient'
          );
        }
      } else {
        // Direct message
        if (!recipientId) {
          return ResponseHandler.badRequest(res, 'Recipient ID is required for direct messages');
        }

        // Students can only message lecturers
        if (senderRole === 'student') {
          const recipientData = await sequelize.query(
            `SELECT role FROM users WHERE id = ?`,
            {
              replacements: [recipientId],
              type: sequelize.QueryTypes.SELECT,
            }
          );

          if (!recipientData[0] || recipientData[0].role !== 'lecturer') {
            return ResponseHandler.forbidden(
              res,
              'Students can only send messages to lecturers'
            );
          }
        }
      }

      // Insert message
      const result = await sequelize.query(
        `INSERT INTO messages (sender_id, sender_role, recipient_id, recipient_role, subject, body, is_broadcast, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        RETURNING *`,
        {
          replacements: [
            senderId,
            senderRole,
            recipientId || null,
            recipientRole || null,
            subject,
            body,
            isBroadcast || false,
          ],
          type: sequelize.QueryTypes.INSERT,
        }
      );

      const newMessage = result[0][0];

      // Get full message with user details
      const fullMessage = await sequelize.query(
        `SELECT * FROM messages_with_users WHERE id = ?`,
        {
          replacements: [newMessage.id],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      res.status(201).json({
        ok: true,
        message: fullMessage[0],
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PUT /api/messages/:id/read
 * Mark a message as read
 */
router.put('/:id/read', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    // Verify user is the recipient
    const messages = await sequelize.query(
      `SELECT recipient_id FROM messages WHERE id = ?`,
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const message = messages[0];
    if (!message) {
      return ResponseHandler.notFound(res, 'Message not found');
    }

    if (message.recipient_id !== userId) {
      return ResponseHandler.forbidden(res, 'You can only mark your own messages as read');
    }

    await sequelize.query(
      `UPDATE messages SET is_read = TRUE, read_at = NOW(), updated_at = NOW() WHERE id = ?`,
      { replacements: [id] }
    );

    res.json({ ok: true, message: 'Message marked as read' });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/messages/:id
 * Delete a message (only admins or sender can delete)
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const userRole = req.user.role;

    // Verify user is the sender or admin
    const messages = await sequelize.query(`SELECT sender_id FROM messages WHERE id = ?`, {
      replacements: [id],
      type: sequelize.QueryTypes.SELECT,
    });

    const message = messages[0];
    if (!message) {
      return ResponseHandler.notFound(res, 'Message not found');
    }

    if (message.sender_id !== userId && userRole !== 'admin') {
      return ResponseHandler.forbidden(
        res,
        'You can only delete your own messages or be an administrator'
      );
    }

    await sequelize.query(`DELETE FROM messages WHERE id = ?`, {
      replacements: [id],
    });

    res.json({ ok: true, message: 'Message deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
