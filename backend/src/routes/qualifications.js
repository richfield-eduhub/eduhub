const express = require('express');
const { Qualification, Module } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/qualifications  — public
router.get('/', async (req, res) => {
  const qualifications = await Qualification.findAll({
    where: { isActive: true },
    include: [{ model: Module, as: 'modules' }],
  });
  res.json(qualifications);
});

// GET /api/qualifications/:id  — public
router.get('/:id', async (req, res) => {
  const q = await Qualification.findByPk(req.params.id, {
    include: [{ model: Module, as: 'modules' }],
  });
  if (!q) return res.status(404).json({ message: 'Qualification not found' });
  res.json(q);
});

// POST /api/qualifications  — admin only
router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  const { code, name, faculty, durationYears, totalFee } = req.body;
  if (!code || !name)
    return res.status(400).json({ message: 'code and name are required' });
  const q = await Qualification.create({ code, name, faculty, durationYears, totalFee });
  res.status(201).json(q);
});

// PATCH /api/qualifications/:id  — admin only
router.patch('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const q = await Qualification.findByPk(req.params.id);
  if (!q) return res.status(404).json({ message: 'Qualification not found' });
  await q.update(req.body);
  res.json(q);
});

module.exports = router;
