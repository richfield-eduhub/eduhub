const express = require('express');
const { Module, Qualification } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/modules  — authenticated (students see their qualification's modules)
router.get('/', authenticate, async (req, res) => {
  const { qualificationId, year, semester } = req.query;
  const where = { isActive: true };
  if (qualificationId) where.qualificationId = qualificationId;
  if (year) where.year = year;
  if (semester) where.semester = semester;

  const modules = await Module.findAll({
    where,
    include: [{ model: Qualification, as: 'qualification' }],
  });
  res.json(modules);
});

// GET /api/modules/:id
router.get('/:id', authenticate, async (req, res) => {
  const module = await Module.findByPk(req.params.id, {
    include: [{ model: Qualification, as: 'qualification' }],
  });
  if (!module) return res.status(404).json({ message: 'Module not found' });
  res.json(module);
});

// POST /api/modules  — admin only
router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  const { code, name, credits, year, semester, qualificationId } = req.body;
  if (!code || !name || !qualificationId)
    return res.status(400).json({ message: 'code, name and qualificationId are required' });
  const module = await Module.create({ code, name, credits, year, semester, qualificationId });
  res.status(201).json(module);
});

// PATCH /api/modules/:id  — admin only
router.patch('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const module = await Module.findByPk(req.params.id);
  if (!module) return res.status(404).json({ message: 'Module not found' });
  await module.update(req.body);
  res.json(module);
});

module.exports = router;
