const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Application, User } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Generate a reference number: APP-YYYY-XXXXXXXX
function generateRef() {
  const year = new Date().getFullYear();
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `APP-${year}-${rand}`;
}

// POST /api/applications  — public, no auth required
router.post('/', async (req, res) => {
  const {
    firstName, lastName, idNumber, dateOfBirth, gender, nationality,
    phone, email, addressStreet, addressCity, addressProvince, addressPostalCode,
    highSchool, matricYear, matricSubjects, previousTertiary,
    payerName, payerRelation, payerPhone, payerEmail,
    qualificationId, qualificationName,
    documents, termsAccepted,
  } = req.body;

  if (!firstName || !lastName || !idNumber || !email || !termsAccepted)
    return res.status(400).json({ message: 'Required fields missing or T&Cs not accepted' });

  // Prevent duplicate applications for same ID number
  const existing = await Application.findOne({ where: { idNumber } });
  if (existing)
    return res.status(409).json({
      message: 'An application with this ID number already exists',
      referenceNumber: existing.referenceNumber,
    });

  const application = await Application.create({
    referenceNumber: generateRef(),
    firstName, lastName, idNumber, dateOfBirth, gender, nationality,
    phone, email, addressStreet, addressCity, addressProvince, addressPostalCode,
    highSchool, matricYear, matricSubjects, previousTertiary,
    payerName, payerRelation, payerPhone, payerEmail,
    qualificationId, qualificationName,
    documents, termsAccepted,
  });

  // TODO: send confirmation email to applicant here

  res.status(201).json({
    message: 'Application submitted successfully',
    referenceNumber: application.referenceNumber,
  });
});

// GET /api/applications  — admin only
router.get('/', authenticate, requireRole('admin'), async (req, res) => {
  const { status } = req.query;
  const where = status ? { status } : {};
  const applications = await Application.findAll({ where, order: [['createdAt', 'DESC']] });
  res.json(applications);
});

// GET /api/applications/:id  — admin only
router.get('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const application = await Application.findByPk(req.params.id);
  if (!application) return res.status(404).json({ message: 'Application not found' });
  res.json(application);
});

// PATCH /api/applications/:id/approve  — admin only
router.patch('/:id/approve', authenticate, requireRole('admin'), async (req, res) => {
  const application = await Application.findByPk(req.params.id);
  if (!application) return res.status(404).json({ message: 'Application not found' });
  if (application.status !== 'pending')
    return res.status(400).json({ message: `Application is already ${application.status}` });

  // Generate a temporary password and create the student user
  const tempPassword = crypto.randomBytes(4).toString('hex');
  const user = await User.create({
    firstName: application.firstName,
    lastName: application.lastName,
    email: application.email,
    password: tempPassword,
    role: 'student',
  });

  application.status = 'approved';
  application.userId = user.id;
  await application.save();

  // TODO: send email with user.studentNumber and tempPassword

  res.json({
    message: 'Application approved',
    studentNumber: user.studentNumber,
    tempPassword, // remove this in production; send via email only
  });
});

// PATCH /api/applications/:id/decline  — admin only
router.patch('/:id/decline', authenticate, requireRole('admin'), async (req, res) => {
  const { reason } = req.body;
  const application = await Application.findByPk(req.params.id);
  if (!application) return res.status(404).json({ message: 'Application not found' });
  if (application.status !== 'pending')
    return res.status(400).json({ message: `Application is already ${application.status}` });

  application.status = 'declined';
  application.declineReason = reason || null;
  await application.save();

  // TODO: send decline reason email to applicant

  res.json({ message: 'Application declined' });
});

module.exports = router;
