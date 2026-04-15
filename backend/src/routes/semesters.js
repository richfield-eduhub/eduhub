const express = require('express');
const { Semester } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/semesters  — authenticated
router.get('/', authenticate, async (req, res) => {
  const semesters = await Semester.findAll({ order: [['year', 'DESC'], ['semesterNumber', 'DESC']] });
  res.json(semesters);
});

// GET /api/semesters/active  — get the current active semester
router.get('/active', authenticate, async (req, res) => {
  const semester = await Semester.findOne({ where: { isActive: true } });
  if (!semester) return res.status(404).json({ message: 'No active semester' });
  res.json(semester);
});

// POST /api/semesters/start  — admin: start a new semester
router.post('/start', authenticate, requireRole('admin'), async (req, res) => {
  const { name, year, semesterNumber, startDate, endDate } = req.body;
  if (!name || !year || !semesterNumber)
    return res.status(400).json({ message: 'name, year and semesterNumber are required' });

  // Deactivate any currently active semester
  await Semester.update({ isActive: false }, { where: { isActive: true } });

  const semester = await Semester.create({
    name, year, semesterNumber, startDate, endDate,
    isActive: true,
    registrationOpen: true,
  });

  res.status(201).json({ message: 'Semester started', semester });
});

// POST /api/semesters/:id/end  — admin: end a semester
router.post('/:id/end', authenticate, requireRole('admin'), async (req, res) => {
  const semester = await Semester.findByPk(req.params.id);
  if (!semester) return res.status(404).json({ message: 'Semester not found' });

  semester.isActive = false;
  semester.registrationOpen = false;
  await semester.save();

  res.json({ message: 'Semester ended', semester });
});

// PATCH /api/semesters/:id/toggle-registration  — admin: open/close registration
router.patch('/:id/toggle-registration', authenticate, requireRole('admin'), async (req, res) => {
  const semester = await Semester.findByPk(req.params.id);
  if (!semester) return res.status(404).json({ message: 'Semester not found' });

  semester.registrationOpen = !semester.registrationOpen;
  await semester.save();

  res.json({
    message: `Registration ${semester.registrationOpen ? 'opened' : 'closed'}`,
    semester,
  });
});

module.exports = router;
