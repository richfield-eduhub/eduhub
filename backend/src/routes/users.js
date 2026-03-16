// backend/src/routes/users.js
const express = require('express');
const router  = express.Router();
const { users, passwords, safeUser } = require('../models/store');
const { authMiddleware } = require('../middleware/auth');

// All user routes require authentication
router.use(authMiddleware);

// ── GET /api/users/profile ──────────────────────────────────────────────────
router.get('/profile', (req, res) => {
  res.json({ user: safeUser(req.user) });
});

// ── PUT /api/users/profile ──────────────────────────────────────────────────
router.put('/profile', (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  const { firstName, lastName, phone, dateOfBirth, address, email } = req.body;

  if (firstName) { user.firstName = firstName; }
  if (lastName)  { user.lastName  = lastName;  }
  if (phone)     { user.phone     = phone;     }
  if (dateOfBirth) { user.dateOfBirth = dateOfBirth; }
  if (address)   { user.address   = address;   }

  // Update derived full name
  if (firstName || lastName) {
    user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  }

  // Allow email change only if new email not taken
  if (email && email.toLowerCase() !== user.email) {
    const emailLower = email.toLowerCase();
    if (users.find(u => u.id !== user.id && u.email.toLowerCase() === emailLower)) {
      return res.status(409).json({ message: 'That email is already in use.' });
    }
    // Move password to new email key
    passwords[emailLower] = passwords[user.email.toLowerCase()];
    delete passwords[user.email.toLowerCase()];
    user.email = emailLower;
  }

  user.updatedAt = new Date().toISOString();
  res.json({ message: 'Profile updated successfully.', user: safeUser(user) });
});

// ── PUT /api/users/password ─────────────────────────────────────────────────
router.put('/password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'currentPassword and newPassword are required.' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters.' });
  }

  const emailKey = req.user.email.toLowerCase();
  if (passwords[emailKey] !== currentPassword) {
    return res.status(401).json({ message: 'Current password is incorrect.' });
  }

  passwords[emailKey] = newPassword;

  // Clear tempPassword flag
  const user = users.find(u => u.id === req.user.id);
  if (user) user.tempPassword = false;

  res.json({ message: 'Password changed successfully.' });
});

// ── POST /api/users/avatar ──────────────────────────────────────────────────
router.post('/avatar', (req, res) => {
  // In production: parse multipart/form-data, save file, update user.avatarUrl
  const user = users.find(u => u.id === req.user.id);
  if (user) {
    user.avatarUrl = `/uploads/avatars/${user.id}.jpg`; // placeholder
    user.updatedAt = new Date().toISOString();
  }
  res.json({ message: 'Avatar uploaded successfully.', avatarUrl: user?.avatarUrl || null });
});

module.exports = router;
