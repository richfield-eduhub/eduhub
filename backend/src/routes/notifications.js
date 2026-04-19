// backend/src/routes/notifications.js
const express = require('express');
const router  = express.Router();
const { notifications } = require('../models/store');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// ── GET /api/notifications ──────────────────────────────────────────────────
router.get('/', (req, res) => {
  const mine = notifications.filter(
    n => n.userId === req.user.id || n.userId === req.user.studentId
  );
  const unread = mine.filter(n => !n.read).length;
  res.json({ notifications: mine, unread, total: mine.length });
});

// ── PUT /api/notifications/:id/read ────────────────────────────────────────
router.put('/:id/read', (req, res) => {
  const notif = notifications.find(n => n.id === req.params.id);
  if (!notif) return res.status(404).json({ message: 'Notification not found.' });

  if (notif.userId !== req.user.id && notif.userId !== req.user.studentId) {
    return res.status(403).json({ message: 'Access denied.' });
  }

  notif.read   = true;
  notif.readAt = new Date().toISOString();

  res.json({ message: 'Notification marked as read.', notification: notif });
});

// ── DELETE /api/notifications/:id ──────────────────────────────────────────
router.delete('/:id', (req, res) => {
  const idx = notifications.findIndex(n => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Notification not found.' });

  const notif = notifications[idx];
  if (notif.userId !== req.user.id && notif.userId !== req.user.studentId) {
    return res.status(403).json({ message: 'Access denied.' });
  }

  notifications.splice(idx, 1);
  res.json({ message: 'Notification deleted.' });
});

module.exports = router;
