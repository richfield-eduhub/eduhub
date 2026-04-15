/**
 * Notification Routes — in-memory store per server session
 * Frontend uses these for the notification bell.
 */
const express = require('express');
const router  = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');

// Simple in-memory store (resets on server restart; replace with DB table if needed)
const notifications = [];
let   notifSeq      = 1;

function userNotifs(userId) {
  return notifications.filter(n => n.userId === userId);
}

router.use(authenticateToken);

// GET /api/notifications
router.get('/', (req, res) => {
  const mine   = userNotifs(req.user.user_id);
  const unread = mine.filter(n => !n.read).length;
  res.json({ ok: true, notifications: mine, unread, total: mine.length });
});

// PUT /api/notifications/:id/read
router.put('/:id/read', (req, res) => {
  const notif = notifications.find(n => n.id === req.params.id && n.userId === req.user.user_id);
  if (!notif) return res.status(404).json({ ok: false, message: 'Notification not found.' });
  notif.read   = true;
  notif.readAt = new Date().toISOString();
  res.json({ ok: true, message: 'Marked as read.', notification: notif });
});

// DELETE /api/notifications/:id
router.delete('/:id', (req, res) => {
  const idx = notifications.findIndex(n => n.id === req.params.id && n.userId === req.user.user_id);
  if (idx === -1) return res.status(404).json({ ok: false, message: 'Notification not found.' });
  notifications.splice(idx, 1);
  res.json({ ok: true, message: 'Notification deleted.' });
});

// Export the push helper so other routes can create notifications
router.pushNotif = function(userId, title, message, type = 'info') {
  notifications.unshift({ id: String(notifSeq++), userId, title, message, type, read: false, createdAt: new Date().toISOString() });
};

module.exports = router;
