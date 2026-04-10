/**
 * Users Routes — /api/users/*
 * Profile read/update for the logged-in user.
 */
const express   = require('express');
const router    = express.Router();
const bcrypt    = require('bcryptjs');
const sequelize = require('../config/database');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);

// GET /api/users/profile
router.get('/profile', async (req, res, next) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT u.id as user_id, u.email, u.role, u.account_status, u.created_at,
              ud.first_name, ud.last_name, ud.phone, ud.date_of_birth, ud.id_number,
              ud.nationality, ud.gender, ud.city, ud.province, ud.street_address,
              ud.suburb, ud.postal_code
       FROM users u
       LEFT JOIN user_details ud ON u.id = ud.user_id
       WHERE u.id = ?`,
      { replacements: [req.user.user_id] }
    );
    const user = rows[0];
    if (!user) return res.status(404).json({ ok: false, message: 'User not found.' });
    res.json({ ok: true, user });
  } catch (err) { next(err); }
});

// PUT /api/users/profile
router.put('/profile', async (req, res, next) => {
  try {
    const { firstName, lastName, first_name, last_name, phone, dateOfBirth, date_of_birth,
            address, street_address, suburb, city, province, postal_code } = req.body;
    const fn  = firstName  || first_name;
    const ln  = lastName   || last_name;
    const dob = dateOfBirth || date_of_birth;
    const sa  = address    || street_address;

    await sequelize.query(
      `UPDATE user_details
       SET first_name = COALESCE(?, first_name),
           last_name  = COALESCE(?, last_name),
           phone      = COALESCE(?, phone),
           date_of_birth = COALESCE(?, date_of_birth),
           street_address = COALESCE(?, street_address),
           suburb     = COALESCE(?, suburb),
           city       = COALESCE(?, city),
           province   = COALESCE(?, province),
           postal_code = COALESCE(?, postal_code),
           updated_at = NOW()
       WHERE user_id = ?`,
      { replacements: [fn||null, ln||null, phone||null, dob||null, sa||null,
                        suburb||null, city||null, province||null, postal_code||null,
                        req.user.user_id] }
    );

    // Fetch updated user
    const [rows] = await sequelize.query(
      `SELECT u.id as user_id, u.email, u.role, ud.first_name, ud.last_name, ud.phone
       FROM users u LEFT JOIN user_details ud ON u.id = ud.user_id WHERE u.id = ?`,
      { replacements: [req.user.user_id] }
    );
    res.json({ ok: true, message: 'Profile updated.', user: rows[0] });
  } catch (err) { next(err); }
});

// PUT /api/users/password
router.put('/password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ ok: false, message: 'currentPassword and newPassword are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ ok: false, message: 'New password must be at least 8 characters.' });
    }
    const [rows] = await sequelize.query(
      `SELECT password_hash FROM users WHERE id = ?`,
      { replacements: [req.user.user_id] }
    );
    const user = rows[0];
    if (!user) return res.status(404).json({ ok: false, message: 'User not found.' });

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(401).json({ ok: false, message: 'Current password is incorrect.' });

    const hash = await bcrypt.hash(newPassword, 12);
    await sequelize.query(
      `UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?`,
      { replacements: [hash, req.user.user_id] }
    );
    res.json({ ok: true, message: 'Password changed successfully.' });
  } catch (err) { next(err); }
});

module.exports = router;
