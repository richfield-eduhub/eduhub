const express = require('express');
const { User, Application, Registration } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/profile  — current logged-in user
router.get('/profile', authenticate, async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] },
    include: [{ model: Application, as: 'application' }],
  });
  res.json(user);
});

// PATCH /api/users/profile  — update own profile
router.patch('/profile', authenticate, async (req, res) => {
  const allowed = ['firstName', 'lastName', 'phone'];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  );
  await User.update(updates, { where: { id: req.user.id } });
  res.json({ message: 'Profile updated' });
});

// GET /api/users  — admin: list all students
router.get('/', authenticate, requireRole('admin'), async (req, res) => {
  const { role } = req.query;
  const where = role ? { role } : {};
  const users = await User.findAll({
    where,
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'DESC']],
  });
  res.json(users);
});

// GET /api/users/:id  — admin: get single user
router.get('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password'] },
    include: [{ model: Application, as: 'application' }],
  });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

module.exports = router;
