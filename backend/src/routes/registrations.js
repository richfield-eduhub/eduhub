const express = require('express');
const { Registration, Semester, Module, User } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /api/registrations  — student submits registration for current semester
router.post('/', authenticate, requireRole('student'), async (req, res) => {
  const { moduleIds } = req.body;
  if (!moduleIds || !Array.isArray(moduleIds) || moduleIds.length === 0)
    return res.status(400).json({ message: 'moduleIds array is required' });

  const semester = await Semester.findOne({ where: { isActive: true, registrationOpen: true } });
  if (!semester)
    return res.status(400).json({ message: 'Registration is not currently open' });

  // Prevent duplicate registration in same semester
  const existing = await Registration.findOne({
    where: { userId: req.user.id, semesterId: semester.id },
  });
  if (existing)
    return res.status(409).json({ message: 'Already registered for this semester' });

  // Calculate quotation from selected modules
  const modules = await Module.findAll({ where: { id: moduleIds } });
  const quotationAmount = modules.length * 3500; // placeholder fee per module

  const registration = await Registration.create({
    userId: req.user.id,
    semesterId: semester.id,
    modules: moduleIds,
    quotationAmount,
  });

  // TODO: send registration confirmation email

  res.status(201).json({
    message: 'Registration submitted',
    registration,
    quotationAmount,
  });
});

// GET /api/registrations  — student sees own; admin sees all
router.get('/', authenticate, async (req, res) => {
  const where = req.user.role === 'admin' ? {} : { userId: req.user.id };
  const { status } = req.query;
  if (status) where.status = status;

  const registrations = await Registration.findAll({
    where,
    include: [
      { model: User, as: 'student', attributes: ['id', 'firstName', 'lastName', 'studentNumber'] },
      { model: Semester, as: 'semester' },
    ],
    order: [['createdAt', 'DESC']],
  });
  res.json(registrations);
});

// GET /api/registrations/:id
router.get('/:id', authenticate, async (req, res) => {
  const reg = await Registration.findByPk(req.params.id, {
    include: [
      { model: User, as: 'student', attributes: ['id', 'firstName', 'lastName', 'studentNumber'] },
      { model: Semester, as: 'semester' },
    ],
  });
  if (!reg) return res.status(404).json({ message: 'Registration not found' });

  // Students can only see their own
  if (req.user.role === 'student' && reg.userId !== req.user.id)
    return res.status(403).json({ message: 'Forbidden' });

  res.json(reg);
});

// PATCH /api/registrations/:id/approve  — admin only
router.patch('/:id/approve', authenticate, requireRole('admin'), async (req, res) => {
  const reg = await Registration.findByPk(req.params.id);
  if (!reg) return res.status(404).json({ message: 'Registration not found' });
  if (reg.status !== 'pending')
    return res.status(400).json({ message: `Registration is already ${reg.status}` });

  reg.status = 'approved';
  await reg.save();

  // TODO: send approval email to student

  res.json({ message: 'Registration approved', registration: reg });
});

// PATCH /api/registrations/:id/decline  — admin only
router.patch('/:id/decline', authenticate, requireRole('admin'), async (req, res) => {
  const { reason } = req.body;
  const reg = await Registration.findByPk(req.params.id);
  if (!reg) return res.status(404).json({ message: 'Registration not found' });
  if (reg.status !== 'pending')
    return res.status(400).json({ message: `Registration is already ${reg.status}` });

  reg.status = 'declined';
  reg.declineReason = reason || null;
  await reg.save();

  // TODO: send decline email to student

  res.json({ message: 'Registration declined', registration: reg });
});

module.exports = router;
