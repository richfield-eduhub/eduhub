/**
 * Application Service — public admissions (PostgreSQL schema)
 */

const crypto = require('crypto');
const sequelize = require('../config/database');

const { APPLICATION_STATUS, PAGINATION } = require('../utils/constants');

const ADMIN_APPLICATION_STATUSES = [
  APPLICATION_STATUS.UNDER_REVIEW,
  APPLICATION_STATUS.APPROVED,
  APPLICATION_STATUS.REJECTED,
  APPLICATION_STATUS.CANCELLED,
];

const FINAL_APPLICATION_STATUSES = [APPLICATION_STATUS.APPROVED, APPLICATION_STATUS.REJECTED];

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


function isSouthAfricanNationality(nationality) {
  return String(nationality || '').trim() === 'South African';
}

const GENDER_VALUES = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

/**
 * Identity + full form validation when submitting (pending), aligned with admissions capture.
 */
function assertIdentityForSubmit(nationality, idNumber, passportNumber) {
  if (isSouthAfricanNationality(nationality)) {
    const id = String(idNumber || '').trim();
    if (!/^\d{13}$/.test(id)) {
      throw {
        statusCode: 400,
        message: 'South African applicants must provide a valid 13-digit ID number',
      };
    }
  } else {
    const pass = String(passportNumber || '').trim();
    if (pass.length < 5) {
      throw {
        statusCode: 400,
        message: 'Foreign nationals must provide a passport number (at least 5 characters)',
      };
    }
  }
}

function assertFullApplicationForSubmit(payload) {
  const {
    date_of_birth,
    gender,
    street_address,
    city,
    province,
    high_school,
    highest_grade,
    payer_name,
    payer_phone,
    admission_for,
    application_type,
    study_year,
  } = payload;

  if (!date_of_birth) {
    throw { statusCode: 400, message: 'date_of_birth is required to submit' };
  }
  if (!gender || !GENDER_VALUES.includes(String(gender))) {
    throw {
      statusCode: 400,
      message: `gender is required to submit and must be one of: ${GENDER_VALUES.join(', ')}`,
    };
  }
  if (!street_address || !city || !province) {
    throw {
      statusCode: 400,
      message: 'street_address, city, and province are required to submit',
    };
  }
  if (!high_school || !highest_grade) {
    throw {
      statusCode: 400,
      message: 'high_school and highest_grade are required to submit',
    };
  }
  if (!payer_name || !String(payer_name).trim()) {
    throw { statusCode: 400, message: 'payer_name is required to submit' };
  }
  if (!payer_phone || !String(payer_phone).trim()) {
    throw { statusCode: 400, message: 'payer_phone is required to submit' };
  }
  if (!admission_for) {
    throw { statusCode: 400, message: 'admission_for is required to submit' };
  }
  if (!application_type) {
    throw { statusCode: 400, message: 'application_type is required to submit' };
  }
  const sy = study_year != null ? Number(study_year) : NaN;
  if (!Number.isInteger(sy) || sy < 1 || sy > 3) {
    throw {
      statusCode: 400,
      message: 'study_year is required to submit and must be 1, 2, or 3',
    };
  }
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

    return row;
  }

  async findDuplicateOpenApplication(
    qualificationId,
    nationality,
    idNumber,
    passportNumber,
    transaction
  ) {
    const sa = isSouthAfricanNationality(nationality);
    if (sa) {
      const id = idNumber ? String(idNumber).trim() : '';
      if (!id) return null;
      const [row] = await sequelize.query(
        `SELECT id, reference_number, status
         FROM applications
         WHERE qualification_id = ?
           AND TRIM(COALESCE(nationality, 'South African')) = 'South African'
           AND id_number = ?
           AND status IN (?, ?, ?)`,
        {
          replacements: [
            qualificationId,
            id,
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
    const pass = passportNumber ? String(passportNumber).trim() : '';
    if (!pass) return null;

    const [row] = await sequelize.query(
      `SELECT id, reference_number, status
       FROM applications
       WHERE qualification_id = ?
         AND TRIM(COALESCE(nationality, '')) != 'South African'
         AND passport_number = ?
         AND status IN (?, ?, ?)`,
      {
        replacements: [
          qualificationId,
          pass,
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
   * Prior rejection for the same identity + qualification — applicant may not apply again.
   */
  async findRejectedApplication(
    qualificationId,
    nationality,
    idNumber,
    passportNumber,
    transaction
  ) {
    const sa = isSouthAfricanNationality(nationality);
    if (sa) {
      const id = idNumber ? String(idNumber).trim() : '';
      if (!id) return null;
      const [row] = await sequelize.query(
        `SELECT id, reference_number, status
         FROM applications
         WHERE qualification_id = ?
           AND TRIM(COALESCE(nationality, 'South African')) = 'South African'
           AND id_number = ?
           AND status = ?`,
        {
          replacements: [
            qualificationId,
            id,
            APPLICATION_STATUS.REJECTED,
          ],
          type: sequelize.QueryTypes.SELECT,
          transaction,
        }
      );
      return row || null;
    }
    const pass = passportNumber ? String(passportNumber).trim() : '';
    if (!pass) return null;

    const [row] = await sequelize.query(
      `SELECT id, reference_number, status
       FROM applications
       WHERE qualification_id = ?
         AND TRIM(COALESCE(nationality, '')) != 'South African'
         AND passport_number = ?
         AND status = ?`,
      {
        replacements: [
          qualificationId,
          pass,
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


    const nationalityMerged =
      payload.nationality !== undefined
        ? String(payload.nationality).trim()
        : existing.nationality != null
          ? String(existing.nationality).trim()
          : 'South African';

    const idNumber =
      payload.id_number !== undefined
        ? String(payload.id_number).trim()
        : existing.id_number != null
          ? String(existing.id_number).trim()
          : '';

    const passportNumber =
      payload.passport_number !== undefined
        ? String(payload.passport_number).trim()
        : existing.passport_number != null
          ? String(existing.passport_number).trim()
          : '';

    const mergedForSubmit = {
      date_of_birth:
        payload.date_of_birth !== undefined
          ? payload.date_of_birth
          : existing.date_of_birth,
      gender: payload.gender !== undefined ? payload.gender : existing.gender,
      street_address:
        payload.street_address !== undefined
          ? payload.street_address
          : existing.street_address,
      city: payload.city !== undefined ? payload.city : existing.city,
      province: payload.province !== undefined ? payload.province : existing.province,
      high_school:
        payload.high_school !== undefined ? payload.high_school : existing.high_school,
      highest_grade:
        payload.highest_grade !== undefined
          ? payload.highest_grade
          : existing.highest_grade,
      payer_name:
        payload.payer_name !== undefined ? payload.payer_name : existing.payer_name,
      payer_phone:
        payload.payer_phone !== undefined ? payload.payer_phone : existing.payer_phone,
      admission_for:
        payload.admission_for !== undefined
          ? payload.admission_for
          : existing.admission_for,
      application_type:
        payload.application_type !== undefined
          ? payload.application_type
          : existing.application_type,
      study_year:
        payload.study_year !== undefined ? payload.study_year : existing.study_year,
      nationality: nationalityMerged,
    };

    if (submitting) {
      assertFullApplicationForSubmit(mergedForSubmit);
      assertIdentityForSubmit(nationalityMerged, idNumber, passportNumber);
    }

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


    const altEmailNorm =
      payload.alt_email !== undefined
        ? payload.alt_email != null && String(payload.alt_email).trim()
          ? normalizeEmail(payload.alt_email)
          : null
        : existing.alt_email != null && String(existing.alt_email).trim()
          ? normalizeEmail(existing.alt_email)
          : null;

    const docsMerged =
      payload.docs_uploaded !== undefined
        ? payload.docs_uploaded == null
          ? null
          : typeof payload.docs_uploaded === 'string'
            ? payload.docs_uploaded
            : JSON.stringify(payload.docs_uploaded)
        : existing.docs_uploaded == null
          ? null
          : typeof existing.docs_uploaded === 'string'
            ? existing.docs_uploaded
            : JSON.stringify(existing.docs_uploaded);

    const idForDb = isSouthAfricanNationality(nationalityMerged)
      ? idNumber || null
      : null;
    const passForDb = isSouthAfricanNationality(nationalityMerged)
      ? null
      : passportNumber || null;

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


  _applicationAdminSelect() {
    return `SELECT
         a.id, a.reference_number, a.user_id, a.qualification_id, a.campus_id,
         a.admission_for, a.application_type,
         a.high_school, a.high_school_year, a.highest_grade, a.matric_subjects,
         a.tertiary_institution, a.tertiary_qualification, a.tertiary_year,
         a.payer_name, a.payer_relation, a.payer_phone, a.payer_email, a.payer_address,
         a.status, a.tc_accepted, a.tc_accepted_at, a.submitted_at, a.rejection_reason,
         a.reviewed_at, a.reviewed_by, a.approved_at, a.created_at, a.updated_at,
         a.first_name, a.last_name, a.email, a.phone, a.id_number,
         a.nationality, a.passport_number, a.date_of_birth, a.gender, a.alt_email,
         a.street_address, a.suburb, a.city, a.province, a.postal_code,
         a.study_year, a.docs_uploaded,
         a.qualification_code AS stored_qualification_code,
         a.qualification_name AS stored_qualification_name,
         c.code AS campus_code, c.name AS campus_name, c.city AS campus_city,
         COALESCE(q.code, a.qualification_code) AS qualification_code,
         COALESCE(q.name, a.qualification_name) AS qualification_name,
         ru.email AS reviewer_email`;
  }

  /**
   * Paginated list for admin/staff review.
   */
  async listApplicationsAdmin({
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    status,
    campus_id,
    qualification_id,
    search,
  }) {
    const limitValue = Math.min(
      Math.max(1, parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT),
      PAGINATION.MAX_LIMIT
    );
    const pageNum = Math.max(1, parseInt(page, 10) || PAGINATION.DEFAULT_PAGE);
    const offset = (pageNum - 1) * limitValue;

    const conditions = [];
    const replacements = [];

    if (status) {
      conditions.push('a.status = ?');
      replacements.push(status);
    }
    if (campus_id) {
      conditions.push('a.campus_id = ?');
      replacements.push(campus_id);
    }
    if (qualification_id) {
      conditions.push('a.qualification_id = ?');
      replacements.push(qualification_id);
    }
    if (search && String(search).trim()) {
      const term = `%${String(search).trim()}%`;
      conditions.push(
        `(a.first_name ILIKE ? OR a.last_name ILIKE ? OR a.email ILIKE ? OR a.reference_number ILIKE ? OR a.id_number ILIKE ? OR a.passport_number ILIKE ?)`
      );
      replacements.push(term, term, term, term, term, term);
    }

    const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countRow] = await sequelize.query(
      `SELECT COUNT(*)::int AS total FROM applications a ${whereSql}`,
      {
        replacements: [...replacements],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const rows = await sequelize.query(
      `${this._applicationAdminSelect()}
       FROM applications a
       LEFT JOIN campuses c ON a.campus_id = c.id
       LEFT JOIN qualifications q ON a.qualification_id = q.id
       LEFT JOIN users ru ON a.reviewed_by = ru.id
       ${whereSql}
       ORDER BY a.submitted_at DESC NULLS LAST, a.created_at DESC
       LIMIT ? OFFSET ?`,
      {
        replacements: [...replacements, limitValue, offset],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return {
      applications: rows,
      pagination: {
        page: pageNum,
        limit: limitValue,
        total: countRow.total,
      },
    };
  }

  /**
   * Full application row for admin (no applicant email check).
   */
  async getApplicationByIdAdmin(applicationId) {
    const [row] = await sequelize.query(
      `${this._applicationAdminSelect()}
       FROM applications a
       LEFT JOIN campuses c ON a.campus_id = c.id
       LEFT JOIN qualifications q ON a.qualification_id = q.id
       LEFT JOIN users ru ON a.reviewed_by = ru.id
       WHERE a.id = ?`,
      {
        replacements: [applicationId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!row) {
      throw { statusCode: 404, message: 'Application not found' };
    }

    return row;
  }

  /**
   * Update application workflow status (admin).
   */
  async updateApplicationStatusAdmin(applicationId, reviewerUserId, { status, rejection_reason }) {
    if (!ADMIN_APPLICATION_STATUSES.includes(status)) {
      throw {
        statusCode: 400,
        message: `status must be one of: ${ADMIN_APPLICATION_STATUSES.join(', ')}`,
      };
    }

    if (status === APPLICATION_STATUS.REJECTED) {
      const reason = rejection_reason != null ? String(rejection_reason).trim() : '';
      if (!reason) {
        throw { statusCode: 400, message: 'rejection_reason is required when rejecting' };
      }
    }

    const existing = await this.getApplicationByIdAdmin(applicationId);

    if (FINAL_APPLICATION_STATUSES.includes(existing.status)) {
      throw {
        statusCode: 409,
        message: 'This application is already finalised and cannot be updated',
      };
    }

    const now = new Date();
    let approvedAt = existing.approved_at;
    let rejectionReason = existing.rejection_reason;
    let reviewedAt = now;
    let reviewedBy = reviewerUserId;

    if (status === APPLICATION_STATUS.APPROVED) {
      approvedAt = now;
      rejectionReason = null;
    } else if (status === APPLICATION_STATUS.REJECTED) {
      approvedAt = null;
      rejectionReason = String(rejection_reason).trim();
    } else if (status === APPLICATION_STATUS.UNDER_REVIEW) {
      approvedAt = null;
    } else if (status === APPLICATION_STATUS.CANCELLED) {
      approvedAt = null;
    }

    await sequelize.query(
      `UPDATE applications SET
        status = ?,
        reviewed_by = ?,
        reviewed_at = ?,
        rejection_reason = ?,
        approved_at = ?,
        updated_at = NOW()
      WHERE id = ?`,
      {
        replacements: [
          status,
          reviewedBy,
          reviewedAt,
          rejectionReason,
          approvedAt,
          applicationId,
        ],
      }
    );

    return this.getApplicationByIdAdmin(applicationId);
  }

  /**
   * Application counts grouped by status (admin dashboard).
   */
  async getApplicationStatsByStatus() {
    const rows = await sequelize.query(
      `SELECT status, COUNT(*)::int AS count
       FROM applications
       GROUP BY status
       ORDER BY status`,
      { type: sequelize.QueryTypes.SELECT }
    );
    return rows;
  }
}

module.exports = new ApplicationService();
