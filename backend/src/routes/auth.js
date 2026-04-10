const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  const user = await User.findOne({ where: { email } });
  if (!user || !(await user.validatePassword(password)))
    return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      studentNumber: user.studentNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isPasswordChanged: user.isPasswordChanged,
    },
  });
});

// POST /api/auth/change-password  (first-time login or voluntary)
router.post('/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: 'currentPassword and newPassword are required' });

  const user = await User.findByPk(req.user.id);
  if (!(await user.validatePassword(currentPassword)))
    return res.status(401).json({ message: 'Current password is incorrect' });

  user.password = await bcrypt.hash(newPassword, 10);
  user.isPasswordChanged = true;
  await user.save();

  res.json({ message: 'Password updated successfully' });
});

module.exports = router;
