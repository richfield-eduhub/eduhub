// backend/src/routes/auth.js
const express   = require('express');
const crypto    = require('crypto');
const router    = express.Router();
const { users, passwords, sessions, notifications, generateStudentId, safeUser, uuidv4 } = require('../models/store');
const { authMiddleware } = require('../middleware/auth');

// Simple token generator
function makeToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Add notification helper
function addNotif(userId, title, message, type = 'info') {
  notifications.unshift({
    id: uuidv4(),
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString(),
  });
}

// ── POST /api/auth/register ─────────────────────────────────────────────────
router.post('/register', (req, res) => {
  const { firstName, lastName, email, password, phone, dateOfBirth, idNumber } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'firstName, lastName, email, and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  const emailLower = email.toLowerCase();
  if (users.find(u => u.email.toLowerCase() === emailLower)) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const newUser = {
    id:          uuidv4(),
    name:        `${firstName} ${lastName}`,
    firstName,
    lastName,
    email:       emailLower,
    phone:       phone || '',
    dateOfBirth: dateOfBirth || '',
    idNumber:    idNumber || '',
    role:        'student',
    studentId:   generateStudentId(),
    status:      'active',
    tempPassword: false,
    createdAt:   new Date().toISOString(),
  };

  users.push(newUser);
  passwords[emailLower] = password;

  // Notify admins
  users.filter(u => u.role === 'admin').forEach(a =>
    addNotif(a.id, '🆕 New Account Registered',
      `${newUser.name} (${emailLower}) created an account.`, 'info')
  );

  res.status(201).json({
    message: 'Account created successfully. You can now log in.',
    userId:  newUser.id,
  });
});

// ── POST /api/auth/login ────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const emailLower = email.toLowerCase();
  const user = users.find(u => u.email.toLowerCase() === emailLower);
  if (!user) {
    return res.status(401).json({ message: 'No account found with that email.' });
  }
  if (user.status === 'inactive') {
    return res.status(403).json({ message: 'Your account is deactivated. Contact admissions.' });
  }

  const storedPwd = passwords[emailLower] || passwords[email];
  if (storedPwd !== password) {
    return res.status(401).json({ message: 'Incorrect password.' });
  }

  const token = makeToken();
  sessions[token] = user.id;

  res.json({
    message: 'Login successful.',
    token,
    user: safeUser(user),
  });
});

// ── POST /api/auth/logout ───────────────────────────────────────────────────
router.post('/logout', authMiddleware, (req, res) => {
  delete sessions[req.token];
  res.json({ message: 'Logged out successfully.' });
});

// ── POST /api/auth/forgot-password ─────────────────────────────────────────
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  // Always respond the same way to prevent email enumeration
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (user) {
    // In production: generate a reset token, store it, and send an email
    console.log(`[DEV] Password reset requested for: ${email}`);
  }

  res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
});

// ── POST /api/auth/reset-password ──────────────────────────────────────────
router.post('/reset-password', (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }
  // In production: validate token, find user, update password
  // For demo: return success
  res.json({ message: 'Password has been reset. You can now log in.' });
});

// ── GET /api/auth/verify-email ──────────────────────────────────────────────
router.get('/verify-email', (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: 'Verification token is required.' });
  // In production: validate token and mark user as verified
  res.json({ message: 'Email verified successfully.' });
});

module.exports = router;
