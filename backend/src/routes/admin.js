// backend/src/routes/admin.js
const express = require('express');
const router  = express.Router();
const {
  users, applications, registrations,
  notifications, auditLogs, uuidv4,
} = require('../models/store');
const { authMiddleware, requireRole } = require('../middleware/auth');

// All admin routes require admin role
router.use(authMiddleware, requireRole('admin'));

// ── GET /api/admin/users ────────────────────────────────────────────────────
router.get('/users', (req, res) => {
  // Strip passwords from response
  const safe = users.map(({ password, ...u }) => u);
  res.json({ users: safe, total: safe.length });
});

// ── PUT /api/admin/users/:id/role ───────────────────────────────────────────
router.put('/users/:id/role', (req, res) => {
  const { role } = req.body;
  const validRoles = ['admin', 'student', 'lecturer'];

  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ message: `role must be one of: ${validRoles.join(', ')}` });
  }

  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  // Prevent admin from removing their own admin role
  if (user.id === req.user.id && role !== 'admin') {
    return res.status(400).json({ message: 'You cannot change your own role.' });
  }

  const oldRole  = user.role;
  user.role      = role;
  user.updatedAt = new Date().toISOString();

  auditLogs.unshift({
    id: uuidv4(), action: 'role_change',
    description: `Changed ${user.name}'s role from ${oldRole} to ${role}`,
    performedBy: req.user.name, entityType: 'User', entityId: user.id,
    createdAt: new Date().toISOString(),
  });

  const { password, ...safe } = user;
  res.json({ message: `Role updated to ${role}.`, user: safe });
});

// ── PUT /api/admin/users/:id/status ─────────────────────────────────────────
router.put('/users/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status || !['active', 'inactive'].includes(status)) {
    return res.status(400).json({ message: 'status must be "active" or "inactive".' });
  }

  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  if (user.id === req.user.id && status === 'inactive') {
    return res.status(400).json({ message: 'You cannot deactivate your own account.' });
  }

  user.status    = status;
  user.updatedAt = new Date().toISOString();

  auditLogs.unshift({
    id: uuidv4(), action: status === 'inactive' ? 'deactivate' : 'activate',
    description: `${status === 'inactive' ? 'Deactivated' : 'Activated'} account for ${user.name}`,
    performedBy: req.user.name, entityType: 'User', entityId: user.id,
    createdAt: new Date().toISOString(),
  });

  const { password, ...safe } = user;
  res.json({ message: `Account ${status === 'inactive' ? 'deactivated' : 'activated'}.`, user: safe });
});

// ── GET /api/admin/statistics ───────────────────────────────────────────────
router.get('/statistics', (req, res) => {
  const students   = users.filter(u => u.role === 'student');
  const lecturers  = users.filter(u => u.role === 'lecturer');

  res.json({
    users: {
      total:     users.length,
      students:  students.length,
      lecturers: lecturers.length,
      admins:    users.filter(u => u.role === 'admin').length,
    },
    applications: {
      total:    applications.length,
      pending:  applications.filter(a => a.status === 'pending').length,
      approved: applications.filter(a => a.status === 'approved').length,
      declined: applications.filter(a => a.status === 'declined').length,
    },
    registrations: {
      total:     registrations.length,
      allocated: registrations.filter(r => r.status === 'allocated').length,
      pending:   registrations.filter(r => r.status === 'pending').length,
    },
    notifications: {
      total:  notifications.length,
      unread: notifications.filter(n => !n.read).length,
    },
  });
});

// ── GET /api/admin/audit-logs ───────────────────────────────────────────────
router.get('/audit-logs', (req, res) => {
  const limit  = Math.min(parseInt(req.query.limit  || '50'),  200);
  const offset = parseInt(req.query.offset || '0');
  const slice  = auditLogs.slice(offset, offset + limit);
  res.json({ logs: slice, total: auditLogs.length, limit, offset });
});

module.exports = router;
