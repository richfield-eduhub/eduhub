/**
 * Semester management — PostgreSQL `semesters` table
 */

const sequelize = require('../config/database');

class SemesterService {
  async listSemesters() {
    const rows = await sequelize.query(
      `SELECT id, name, year, semester_number, start_date, end_date,
              registration_open, registration_start_date, registration_end_date, add_drop_deadline,
              is_active, created_at, updated_at
       FROM semesters
       ORDER BY year DESC, semester_number DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );
    return rows;
  }

  async getSemesterById(id) {
    const rows = await sequelize.query(
      `SELECT id, name, year, semester_number, start_date, end_date,
              registration_open, registration_start_date, registration_end_date, add_drop_deadline,
              is_active, created_at, updated_at
       FROM semesters
       WHERE id = ?`,
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT,
      }
    );
    const row = rows[0];
    if (!row) {
      throw { statusCode: 404, message: 'Semester not found' };
    }
    return row;
  }

  /**
   * Make one semester the active academic period: deactivate all others, then
   * create or update the target row (unique on year + semester_number).
   */
  async startSemester({
    name,
    year,
    semester_number,
    start_date,
    end_date,
    registration_open = true,
    registration_start_date,
    registration_end_date,
    add_drop_deadline,
  }) {
    const transaction = await sequelize.transaction();
    try {
      await sequelize.query(`UPDATE semesters SET is_active = false, registration_open = false`, {
        transaction,
      });

      const existing = await sequelize.query(
        `SELECT id FROM semesters WHERE year = ? AND semester_number = ?`,
        {
          replacements: [year, semester_number],
          type: sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      let semesterId;
      if (existing[0]) {
        semesterId = existing[0].id;
        await sequelize.query(
          `UPDATE semesters SET
            name = ?,
            start_date = ?,
            end_date = ?,
            registration_open = ?,
            registration_start_date = ?,
            registration_end_date = ?,
            add_drop_deadline = ?,
            is_active = true,
            updated_at = NOW()
          WHERE id = ?`,
          {
            replacements: [
              name,
              start_date || null,
              end_date || null,
              registration_open,
              registration_start_date || null,
              registration_end_date || null,
              add_drop_deadline || null,
              semesterId,
            ],
            transaction,
          }
        );
      } else {
        await sequelize.query(
          `INSERT INTO semesters (
            name, year, semester_number, start_date, end_date,
            registration_open, registration_start_date, registration_end_date, add_drop_deadline,
            is_active, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, true, NOW(), NOW())`,
          {
            replacements: [
              name,
              year,
              semester_number,
              start_date || null,
              end_date || null,
              registration_open,
              registration_start_date || null,
              registration_end_date || null,
              add_drop_deadline || null,
            ],
            transaction,
          }
        );
        const created = await sequelize.query(
          `SELECT id FROM semesters WHERE year = ? AND semester_number = ?`,
          {
            replacements: [year, semester_number],
            type: sequelize.QueryTypes.SELECT,
            transaction,
          }
        );
        semesterId = created[0].id;
      }

      await transaction.commit();
      return this.getSemesterById(semesterId);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async endSemester(id) {
    await sequelize.query(
      `UPDATE semesters
       SET is_active = false, registration_open = false, updated_at = NOW()
       WHERE id = ?`,
      { replacements: [id] }
    );
    return this.getSemesterById(id);
  }

  async setRegistrationOpen(id, registration_open) {
    await sequelize.query(
      `UPDATE semesters
       SET registration_open = ?, updated_at = NOW()
       WHERE id = ?`,
      { replacements: [registration_open, id] }
    );
    return this.getSemesterById(id);
  }
}

module.exports = new SemesterService();
