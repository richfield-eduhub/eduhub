/**
 * Registration Service
 *
 * Handles course/module registration with validations:
 * - Prerequisite enforcement
 * - Schedule conflict detection
 * - Maximum credits enforcement
 *
 * Design Reference: MISSING_FEATURES.md section 2.5
 */

const sequelize = require('../config/database');

class RegistrationService {
  /**
   * Check if student has completed prerequisites for a module
   */
  async checkPrerequisites(studentId, moduleId) {
    // Get module prerequisites
    const prerequisites = await sequelize.query(
      `SELECT
         mp.prerequisite_module_id,
         mp.minimum_grade,
         m.code AS prerequisite_code,
         m.name AS prerequisite_name
       FROM module_prerequisites mp
       JOIN modules m ON mp.prerequisite_module_id = m.id
       WHERE mp.module_id = ?`,
      {
        replacements: [moduleId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (prerequisites.length === 0) {
      return { satisfied: true, missing: [] };
    }

    const missing = [];

    for (const prereq of prerequisites) {
      // Check if student has completed this prerequisite
      const [completed] = await sequelize.query(
        `SELECT r.grade, r.status
         FROM registrations r
         WHERE r.student_id = ?
           AND r.module_id = ?
           AND r.status = 'completed'`,
        {
          replacements: [studentId, prereq.prerequisite_module_id],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (!completed) {
        missing.push({
          module_code: prereq.prerequisite_code,
          module_name: prereq.prerequisite_name,
          reason: 'Not completed',
        });
        continue;
      }

      // Check if grade meets minimum requirement
      if (prereq.minimum_grade) {
        const gradeOrder = { A: 4, B: 3, C: 2, D: 1, F: 0 };
        const studentGrade = completed.grade ? completed.grade.toUpperCase() : 'F';
        const requiredGrade = prereq.minimum_grade.toUpperCase();

        if (!gradeOrder[studentGrade] || gradeOrder[studentGrade] < gradeOrder[requiredGrade]) {
          missing.push({
            module_code: prereq.prerequisite_code,
            module_name: prereq.prerequisite_name,
            reason: `Grade ${studentGrade} does not meet minimum requirement of ${requiredGrade}`,
          });
        }
      }
    }

    return {
      satisfied: missing.length === 0,
      missing,
    };
  }

  /**
   * Check for schedule conflicts with student's existing registrations
   */
  async checkScheduleConflicts(studentId, moduleId, semesterId) {
    // Get schedule for the module being registered
    const [moduleSchedule] = await sequelize.query(
      `SELECT day_of_week, start_time, end_time
       FROM module_schedules
       WHERE module_id = ?`,
      {
        replacements: [moduleId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!moduleSchedule) {
      // No schedule defined, no conflict possible
      return { hasConflict: false, conflicts: [] };
    }

    // Get all current registrations for the student in this semester
    const existingSchedules = await sequelize.query(
      `SELECT
         m.id AS module_id,
         m.code AS module_code,
         m.name AS module_name,
         ms.day_of_week,
         ms.start_time,
         ms.end_time
       FROM registrations r
       JOIN modules m ON r.module_id = m.id
       JOIN module_schedules ms ON m.id = ms.module_id
       WHERE r.student_id = ?
         AND r.semester_id = ?
         AND r.status IN ('registered', 'active')`,
      {
        replacements: [studentId, semesterId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const conflicts = [];

    for (const existing of existingSchedules) {
      // Check if same day
      if (existing.day_of_week !== moduleSchedule.day_of_week) {
        continue;
      }

      // Check if times overlap
      const existingStart = existing.start_time;
      const existingEnd = existing.end_time;
      const newStart = moduleSchedule.start_time;
      const newEnd = moduleSchedule.end_time;

      const hasOverlap =
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd);

      if (hasOverlap) {
        conflicts.push({
          module_code: existing.module_code,
          module_name: existing.module_name,
          day: existing.day_of_week,
          time: `${existingStart} - ${existingEnd}`,
        });
      }
    }

    return {
      hasConflict: conflicts.length > 0,
      conflicts,
    };
  }

  /**
   * Check if total credits would exceed maximum allowed
   */
  async checkMaximumCredits(studentId, moduleId, semesterId) {
    // Get maximum credits per semester from system settings
    const [setting] = await sequelize.query(
      `SELECT setting_value
       FROM system_settings
       WHERE setting_key = 'max_credits_per_semester'`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const maxCredits = setting ? parseInt(setting.setting_value) : 24; // Default to 24

    // Get credits for the module being registered
    const [module] = await sequelize.query(
      `SELECT credits FROM modules WHERE id = ?`,
      {
        replacements: [moduleId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!module) {
      throw { statusCode: 404, message: 'Module not found' };
    }

    // Get current total credits for this semester
    const [creditTotal] = await sequelize.query(
      `SELECT COALESCE(SUM(m.credits), 0)::int AS total_credits
       FROM registrations r
       JOIN modules m ON r.module_id = m.id
       WHERE r.student_id = ?
         AND r.semester_id = ?
         AND r.status IN ('registered', 'active')`,
      {
        replacements: [studentId, semesterId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const currentCredits = creditTotal.total_credits;
    const newTotal = currentCredits + module.credits;

    return {
      exceedsMaximum: newTotal > maxCredits,
      currentCredits,
      moduleCredits: module.credits,
      newTotal,
      maxCredits,
    };
  }

  /**
   * Register student for a module with all validations
   */
  async registerForModule(studentId, moduleId, semesterId) {
    const transaction = await sequelize.transaction();

    try {
      // Check if already registered
      const [existing] = await sequelize.query(
        `SELECT id, status
         FROM registrations
         WHERE student_id = ? AND module_id = ? AND semester_id = ?`,
        {
          replacements: [studentId, moduleId, semesterId],
          type: sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      if (existing) {
        throw {
          statusCode: 409,
          message: `Already registered for this module with status: ${existing.status}`,
        };
      }

      // 1. Check prerequisites
      const prereqCheck = await this.checkPrerequisites(studentId, moduleId);
      if (!prereqCheck.satisfied) {
        throw {
          statusCode: 400,
          message: 'Prerequisites not satisfied',
          details: prereqCheck.missing,
        };
      }

      // 2. Check schedule conflicts
      const scheduleCheck = await this.checkScheduleConflicts(studentId, moduleId, semesterId);
      if (scheduleCheck.hasConflict) {
        throw {
          statusCode: 409,
          message: 'Schedule conflict detected',
          details: scheduleCheck.conflicts,
        };
      }

      // 3. Check maximum credits
      const creditsCheck = await this.checkMaximumCredits(studentId, moduleId, semesterId);
      if (creditsCheck.exceedsMaximum) {
        throw {
          statusCode: 400,
          message: `Maximum credits exceeded. Current: ${creditsCheck.currentCredits}, Module: ${creditsCheck.moduleCredits}, Max: ${creditsCheck.maxCredits}`,
          details: creditsCheck,
        };
      }

      // All validations passed, create registration
      const [registration] = await sequelize.query(
        `INSERT INTO registrations (
           student_id, module_id, semester_id, status, created_at, updated_at
         ) VALUES (?, ?, ?, 'registered', NOW(), NOW())
         RETURNING id, student_id, module_id, semester_id, status, created_at`,
        {
          replacements: [studentId, moduleId, semesterId],
          transaction,
        }
      );

      await transaction.commit();

      // Return full registration details
      return await this.getRegistrationById(registration[0].id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get registration by ID with full details
   */
  async getRegistrationById(registrationId) {
    const [registration] = await sequelize.query(
      `SELECT
         r.id,
         r.student_id,
         r.module_id,
         r.semester_id,
         r.status,
         r.grade,
         r.registration_date,
         r.created_at,
         m.code AS module_code,
         m.name AS module_name,
         m.credits AS module_credits,
         sem.name AS semester_name,
         sem.year AS semester_year
       FROM registrations r
       JOIN modules m ON r.module_id = m.id
       LEFT JOIN semesters sem ON r.semester_id = sem.id
       WHERE r.id = ?`,
      {
        replacements: [registrationId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!registration) {
      throw { statusCode: 404, message: 'Registration not found' };
    }

    return registration;
  }

  /**
   * Update grade for a registration (lecturer/admin only)
   */
  async updateGrade(registrationId, grade, updatedBy) {
    // Validate grade
    const validGrades = ['A', 'B', 'C', 'D', 'F'];
    if (!validGrades.includes(grade.toUpperCase())) {
      throw {
        statusCode: 400,
        message: `Invalid grade. Must be one of: ${validGrades.join(', ')}`,
      };
    }

    const transaction = await sequelize.transaction();

    try {
      // Check if registration exists
      const [existing] = await sequelize.query(
        `SELECT id, status FROM registrations WHERE id = ?`,
        {
          replacements: [registrationId],
          type: sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      if (!existing) {
        throw { statusCode: 404, message: 'Registration not found' };
      }

      // Update grade and set status to completed if passing grade
      const isPassing = ['A', 'B', 'C', 'D'].includes(grade.toUpperCase());
      const newStatus = isPassing ? 'completed' : 'failed';

      await sequelize.query(
        `UPDATE registrations
         SET grade = ?,
             status = ?,
             updated_at = NOW()
         WHERE id = ?`,
        {
          replacements: [grade.toUpperCase(), newStatus, registrationId],
          transaction,
        }
      );

      // If passed, update student's cumulative GPA and credits
      if (isPassing) {
        const [module] = await sequelize.query(
          `SELECT m.credits
           FROM registrations r
           JOIN modules m ON r.module_id = m.id
           WHERE r.id = ?`,
          {
            replacements: [registrationId],
            type: sequelize.QueryTypes.SELECT,
            transaction,
          }
        );

        if (module) {
          await sequelize.query(
            `UPDATE Students
             SET total_credits_earned = COALESCE(total_credits_earned, 0) + ?,
                 updated_at = NOW()
             WHERE id = (SELECT student_id FROM registrations WHERE id = ?)`,
            {
              replacements: [module.credits, registrationId],
              transaction,
            }
          );
        }
      }

      await transaction.commit();

      return await this.getRegistrationById(registrationId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Drop/cancel a registration
   */
  async dropRegistration(registrationId, studentId) {
    const [registration] = await sequelize.query(
      `SELECT id, status
       FROM registrations
       WHERE id = ? AND student_id = ?`,
      {
        replacements: [registrationId, studentId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!registration) {
      throw { statusCode: 404, message: 'Registration not found or access denied' };
    }

    if (registration.status === 'completed') {
      throw {
        statusCode: 400,
        message: 'Cannot drop a completed registration',
      };
    }

    await sequelize.query(
      `UPDATE registrations
       SET status = 'dropped',
           updated_at = NOW()
       WHERE id = ?`,
      {
        replacements: [registrationId],
      }
    );

    return { success: true, message: 'Registration dropped successfully' };
  }
}

module.exports = new RegistrationService();
