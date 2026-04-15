/**
 * Application Service — public admissions (PostgreSQL schema)
 */

const crypto = require('crypto');
const sequelize = require('../config/database');
const { APPLICATION_STATUS } = require('../utils/constants');

function generateReferenceNumber() {
  const year = new Date().getFullYear();
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `APP-${year}-${rand}`;
}

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

class ApplicationService {
  async assertCampusOffersQualification(campusId, qualificationId, transaction) {
    const [row] = await sequelize.query(
      `SELECT 1 AS ok
       FROM campus_qualifications
       WHERE campus_id = ?
         AND qualification_id = ?
         AND is_active = true`,
      {
        replacements: [campusId, qualificationId],
        type: sequelize.QueryTypes.SELECT,
        transaction,
      }
    );
    if (!row) {
      throw {
        statusCode: 400,
        message: 'This qualification is not offered at the selected campus',
      };
    }
  }

  async assertCampusExists(campusId, transaction) {
    const [row] = await sequelize.query(
      `SELECT id FROM campuses WHERE id = ? AND is_active = true`,
      {
        replacements: [campusId],
        type: sequelize.QueryTypes.SELECT,
        transaction,
      }
    );
    if (!row) {
      throw { statusCode: 400, message: 'Invalid or inactive campus' };
    }
  }

  async assertQualificationExists(qualificationId, transaction) {
    const [row] = await sequelize.query(
      `SELECT id FROM qualifications WHERE id = ? AND is_active = true`,
      {
        replacements: [qualificationId],
        type: sequelize.QueryTypes.SELECT,
        transaction,
      }
    );
    if (!row) {
      throw { statusCode: 400, message: 'Invalid or inactive qualification' };
    }
  }

  async findDuplicateOpenApplication(qualificationId, idNumber, transaction) {
    if (!idNumber) return null;
    const [row] = await sequelize.query(
      `SELECT id, reference_number, status
       FROM applications
       WHERE qualification_id = ?
         AND id_number = ?
         AND status IN (?, ?, ?)`,
      {
        replacements: [
          qualificationId,
          idNumber,
          APPLICATION_STATUS.DRAFT,
          APPLICATION_STATUS.PENDING,
          APPLICATION_STATUS.UNDER_REVIEW,
        ],
        type: sequelize.QueryTypes.SELECT,
        transaction,
      }
    );
    return row || null;
  }

  /**
   * Prior rejection for the same ID + qualification — applicant may not apply again.
   */
  async findRejectedApplication(qualificationId, idNumber, transaction) {
    if (!idNumber) return null;
    const [row] = await sequelize.query(
      `SELECT id, reference_number, status
       FROM applications
       WHERE qualification_id = ?
         AND id_number = ?
         AND status = ?`,
      {
        replacements: [
          qualificationId,
          idNumber,
          APPLICATION_STATUS.REJECTED,
        ],
        type: sequelize.QueryTypes.SELECT,
        transaction,
      }
    );
    return row || null;
  }

  /**
   * Create a new application (no auth). status: draft or pending.
   */
  async createApplication(payload) {
    const transaction = await sequelize.transaction();
    try {
      const {
        campus_id,
        qualification_id,
        admission_for,
        application_type,
        high_school,
        high_school_year,
        highest_grade,
        matric_subjects,
        tertiary_institution,
        tertiary_qualification,
        tertiary_year,
        payer_name,
        payer_relation,
        payer_phone,
        payer_email,
        payer_address,
        first_name,
        last_name,
        email,
        phone,
        id_number,
        tc_accepted,
        status = APPLICATION_STATUS.DRAFT,
      } = payload;

      if (!campus_id || !qualification_id) {
        await transaction.rollback();
        throw { statusCode: 400, message: 'campus_id and qualification_id are required' };
      }

      if (!first_name || !last_name || !email || !phone || !id_number) {
        await transaction.rollback();
        throw {
          statusCode: 400,
          message:
            'first_name, last_name, email, phone, and id_number are required',
        };
      }

      const normalizedEmail = normalizeEmail(email);
      const finalStatus =
        status === APPLICATION_STATUS.PENDING
          ? APPLICATION_STATUS.PENDING
          : APPLICATION_STATUS.DRAFT;

      if (finalStatus === APPLICATION_STATUS.PENDING && !tc_accepted) {
        await transaction.rollback();
        throw {
          statusCode: 400,
          message: 'Terms and conditions must be accepted to submit',
        };
      }

      await this.assertCampusExists(campus_id, transaction);
      await this.assertQualificationExists(qualification_id, transaction);
      await this.assertCampusOffersQualification(
        campus_id,
        qualification_id,
        transaction
      );

      const dup = await this.findDuplicateOpenApplication(
        qualification_id,
        id_number,
        transaction
      );
      if (dup) {
        await transaction.rollback();
        throw {
          statusCode: 409,
          message: 'An open application already exists for this ID number and qualification',
          data: { reference_number: dup.reference_number, status: dup.status },
        };
      }

      const rejected = await this.findRejectedApplication(
        qualification_id,
        id_number.trim(),
        transaction
      );
      if (rejected) {
        await transaction.rollback();
        throw {
          statusCode: 403,
          message:
            'A previous application for this qualification was declined. You cannot submit a new application for the same qualification.',
          data: {
            reason: 'previously_rejected',
            reference_number: rejected.reference_number,
            status: rejected.status,
          },
        };
      }

      const reference_number = generateReferenceNumber();
      const matricJson =
        matric_subjects == null
          ? null
          : typeof matric_subjects === 'string'
            ? matric_subjects
            : JSON.stringify(matric_subjects);

      const now = new Date();
      const tcAccepted = Boolean(tc_accepted);
      const tcAcceptedAt = tcAccepted ? now : null;
      const submittedAt =
        finalStatus === APPLICATION_STATUS.PENDING ? now : null;

      const [results] = await sequelize.query(
        `INSERT INTO applications (
          user_id, reference_number, qualification_id, campus_id,
          admission_for, application_type,
          high_school, high_school_year, highest_grade, matric_subjects,
          tertiary_institution, tertiary_qualification, tertiary_year,
          payer_name, payer_relation, payer_phone, payer_email, payer_address,
          status, tc_accepted, tc_accepted_at, submitted_at,
          first_name, last_name, email, phone, id_number,
          created_at, updated_at
        ) VALUES (
          NULL, ?, ?, ?, ?, ?,
          ?, ?, ?, CAST(? AS jsonb),
          ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          NOW(), NOW()
        )
        RETURNING id, reference_number, status, submitted_at, created_at`,
        {
          replacements: [
            reference_number,
            qualification_id,
            campus_id,
            admission_for || null,
            application_type || 'new',
            high_school || null,
            high_school_year ?? null,
            highest_grade || null,
            matricJson,
            tertiary_institution || null,
            tertiary_qualification || null,
            tertiary_year ?? null,
            payer_name || null,
            payer_relation || null,
            payer_phone || null,
            payer_email || null,
            payer_address || null,
            finalStatus,
            tcAccepted,
            tcAcceptedAt,
            submittedAt,
            first_name.trim(),
            last_name.trim(),
            normalizedEmail,
            phone.trim(),
            id_number.trim(),
          ],
          transaction,
        }
      );

      const row = results[0];
      await transaction.commit();

      return {
        id: row.id,
        reference_number: row.reference_number,
        status: row.status,
        submitted_at: row.submitted_at,
        created_at: row.created_at,
      };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  /**
   * Load application for applicant (reference + email must match).
   */
  async getApplicationForApplicant(applicationId, referenceNumber, email) {
    const em = normalizeEmail(email);
    const [row] = await sequelize.query(
      `SELECT
         a.id, a.reference_number, a.user_id, a.qualification_id, a.campus_id,
         a.admission_for, a.application_type,
         a.high_school, a.high_school_year, a.highest_grade, a.matric_subjects,
         a.tertiary_institution, a.tertiary_qualification, a.tertiary_year,
         a.payer_name, a.payer_relation, a.payer_phone, a.payer_email, a.payer_address,
         a.status, a.tc_accepted, a.tc_accepted_at, a.submitted_at, a.rejection_reason,
         a.reviewed_at, a.created_at, a.updated_at,
         a.first_name, a.last_name, a.email, a.phone, a.id_number,
         c.code AS campus_code, c.name AS campus_name, c.city AS campus_city,
         q.code AS qualification_code, q.name AS qualification_name
       FROM applications a
       LEFT JOIN campuses c ON a.campus_id = c.id
       LEFT JOIN qualifications q ON a.qualification_id = q.id
       WHERE a.id = ?
         AND a.reference_number = ?
         AND LOWER(TRIM(a.email)) = ?`,
      {
        replacements: [applicationId, referenceNumber, em],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!row) {
      throw {
        statusCode: 404,
        message: 'Application not found or reference/email does not match',
      };
    }

    return row;
  }

  /**
   * Lookup by reference + email (no id in path).
   */
  async lookupApplication(referenceNumber, email) {
    const em = normalizeEmail(email);
    const [row] = await sequelize.query(
      `SELECT
         a.id, a.reference_number, a.qualification_id, a.campus_id,
         a.status, a.submitted_at, a.created_at,
         a.first_name, a.last_name, a.email, a.phone, a.id_number,
         c.code AS campus_code, c.name AS campus_name,
         q.code AS qualification_code, q.name AS qualification_name
       FROM applications a
       LEFT JOIN campuses c ON a.campus_id = c.id
       LEFT JOIN qualifications q ON a.qualification_id = q.id
       WHERE a.reference_number = ?
         AND LOWER(TRIM(a.email)) = ?`,
      {
        replacements: [referenceNumber, em],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!row) {
      throw {
        statusCode: 404,
        message: 'Application not found or reference/email does not match',
      };
    }

    return row;
  }

  async updateApplication(applicationId, referenceNumber, email, payload) {
    const existing = await this.getApplicationForApplicant(
      applicationId,
      referenceNumber,
      email
    );

    if (
      ![APPLICATION_STATUS.DRAFT, APPLICATION_STATUS.PENDING].includes(
        existing.status
      )
    ) {
      throw {
        statusCode: 403,
        message: 'This application can no longer be edited online',
      };
    }

    const finalStatus =
      payload.status !== undefined ? payload.status : existing.status;
    const submitting =
      existing.status === APPLICATION_STATUS.DRAFT &&
      finalStatus === APPLICATION_STATUS.PENDING;

    if (submitting && !payload.tc_accepted) {
      throw {
        statusCode: 400,
        message: 'Terms and conditions must be accepted to submit',
      };
    }

    const campusId = payload.campus_id ?? existing.campus_id;
    const qualificationId = payload.qualification_id ?? existing.qualification_id;

    const idNumber =
      payload.id_number !== undefined
        ? String(payload.id_number).trim()
        : existing.id_number;

    const matricMerged =
      payload.matric_subjects !== undefined
        ? typeof payload.matric_subjects === 'string'
          ? payload.matric_subjects
          : JSON.stringify(payload.matric_subjects)
        : existing.matric_subjects == null
          ? null
          : typeof existing.matric_subjects === 'string'
            ? existing.matric_subjects
            : JSON.stringify(existing.matric_subjects);

    const tcAccepted =
      payload.tc_accepted !== undefined
        ? Boolean(payload.tc_accepted)
        : existing.tc_accepted;
    let tcAcceptedAt = existing.tc_accepted_at;
    if (tcAccepted && !existing.tc_accepted) {
      tcAcceptedAt = new Date();
    }

    let submittedAt = existing.submitted_at;
    if (submitting) {
      submittedAt = submittedAt || new Date();
    }

    const emailNorm =
      payload.email !== undefined
        ? normalizeEmail(payload.email)
        : normalizeEmail(existing.email);

    const transaction = await sequelize.transaction();
    try {
      await this.assertCampusExists(campusId, transaction);
      await this.assertQualificationExists(qualificationId, transaction);
      await this.assertCampusOffersQualification(
        campusId,
        qualificationId,
        transaction
      );

      const dup = await this.findDuplicateOpenApplication(
        qualificationId,
        idNumber,
        transaction
      );
      if (dup && String(dup.id) !== String(applicationId)) {
        await transaction.rollback();
        throw {
          statusCode: 409,
          message:
            'An open application already exists for this ID number and qualification',
          data: { reference_number: dup.reference_number, status: dup.status },
        };
      }

      const rejected = await this.findRejectedApplication(
        qualificationId,
        idNumber,
        transaction
      );
      if (rejected && String(rejected.id) !== String(applicationId)) {
        await transaction.rollback();
        throw {
          statusCode: 403,
          message:
            'A previous application for this qualification was declined. You cannot use this qualification again for this ID number.',
          data: {
            reason: 'previously_rejected',
            reference_number: rejected.reference_number,
            status: rejected.status,
          },
        };
      }

      await sequelize.query(
        `UPDATE applications SET
          campus_id = ?,
          qualification_id = ?,
          admission_for = ?,
          application_type = ?,
          high_school = ?,
          high_school_year = ?,
          highest_grade = ?,
          matric_subjects = CAST(? AS jsonb),
          tertiary_institution = ?,
          tertiary_qualification = ?,
          tertiary_year = ?,
          payer_name = ?,
          payer_relation = ?,
          payer_phone = ?,
          payer_email = ?,
          payer_address = ?,
          status = ?,
          tc_accepted = ?,
          tc_accepted_at = ?,
          submitted_at = ?,
          first_name = ?,
          last_name = ?,
          email = ?,
          phone = ?,
          id_number = ?,
          updated_at = NOW()
        WHERE id = ?`,
        {
          replacements: [
            campusId,
            qualificationId,
            payload.admission_for !== undefined
              ? payload.admission_for
              : existing.admission_for,
            payload.application_type !== undefined
              ? payload.application_type
              : existing.application_type,
            payload.high_school !== undefined
              ? payload.high_school
              : existing.high_school,
            payload.high_school_year !== undefined
              ? payload.high_school_year
              : existing.high_school_year,
            payload.highest_grade !== undefined
              ? payload.highest_grade
              : existing.highest_grade,
            matricMerged,
            payload.tertiary_institution !== undefined
              ? payload.tertiary_institution
              : existing.tertiary_institution,
            payload.tertiary_qualification !== undefined
              ? payload.tertiary_qualification
              : existing.tertiary_qualification,
            payload.tertiary_year !== undefined
              ? payload.tertiary_year
              : existing.tertiary_year,
            payload.payer_name !== undefined ? payload.payer_name : existing.payer_name,
            payload.payer_relation !== undefined
              ? payload.payer_relation
              : existing.payer_relation,
            payload.payer_phone !== undefined ? payload.payer_phone : existing.payer_phone,
            payload.payer_email !== undefined ? payload.payer_email : existing.payer_email,
            payload.payer_address !== undefined
              ? payload.payer_address
              : existing.payer_address,
            finalStatus,
            tcAccepted,
            tcAcceptedAt,
            submittedAt,
            payload.first_name !== undefined
              ? String(payload.first_name).trim()
              : existing.first_name,
            payload.last_name !== undefined
              ? String(payload.last_name).trim()
              : existing.last_name,
            emailNorm,
            payload.phone !== undefined
              ? String(payload.phone).trim()
              : existing.phone,
            idNumber,
            applicationId,
          ],
          transaction,
        }
      );

      await transaction.commit();
      return this.getApplicationForApplicant(
        applicationId,
        referenceNumber,
        emailNorm
      );
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}

module.exports = new ApplicationService();
