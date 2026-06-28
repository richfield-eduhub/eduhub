/**
 * Application Service — public admissions (PostgreSQL schema)
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const { generateStudentNumber, formatNumber } = require('../studentNumber');
const emailService = require('./email.service');
const AuditService = require('./audit.service');

const { APPLICATION_STATUS, PAGINATION } = require('../utils/constants');
const { isValidSouthAfricanIdNumber, genderMatchesSaId } = require('../utils/saIdValidator');
const {
  assertContactAvailable,
  findContactConflicts,
} = require('../utils/contactValidator');

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

class ApplicationStudentNumberStore {
  constructor(transaction = null) {
    this.transaction = transaction;
  }

  async has(number) {
    const [row] = await sequelize.query(
      `SELECT 1 AS ok
       FROM applications
       WHERE student_number = ?
       LIMIT 1`,
      {
        replacements: [String(number)],
        type: sequelize.QueryTypes.SELECT,
        transaction: this.transaction,
      }
    );
    return Boolean(row);
  }

  async add(number) {
    if (await this.has(number)) {
      throw new Error('Student number already exists');
    }
  }
}

function generateTemporaryPassword() {
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `EduHub@${random}`;
}

function normalizeDateForUserDetails(value) {
  if (!value) return '2000-01-01';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '2000-01-01';
  return date.toISOString().slice(0, 10);
}

function sanitizePhone(value) {
  const phone = String(value || '').trim();
  return phone || '0000000000';
}

function decideAdmissionsEmailOutcome(draft) {
  const aps = draft?.aps_result || null;
  const desiredQualificationId = draft?.qualification_id;
  const desiredQualificationName = draft?.resolved_qualification_name || draft?.qualification_name || null;

  const recommended = Array.isArray(aps?.recommended) ? aps.recommended : [];
  const possible = Array.isArray(aps?.possibly_eligible) ? aps.possibly_eligible : [];
  const notEligible = Array.isArray(aps?.not_eligible) ? aps.not_eligible : [];

  const desiredRecommended = recommended.find((q) => String(q.qualification_id) === String(desiredQualificationId));
  if (desiredRecommended) {
    return {
      decision: 'conditionally_accepted',
      suggestion: null,
      desiredQualificationName,
    };
  }

  const desiredPossible = possible.find((q) => String(q.qualification_id) === String(desiredQualificationId));
  const desiredNotEligible = notEligible.find((q) => String(q.qualification_id) === String(desiredQualificationId));
  if (desiredPossible || desiredNotEligible) {
    const suggestion = recommended[0] || possible[0] || null;
    return {
      decision: suggestion ? 'suggested_alternative' : 'rejected',
      suggestion: suggestion ? suggestion.qualification_name : null,
      desiredQualificationName,
    };
  }

  return {
    decision: 'conditionally_accepted',
    suggestion: null,
    desiredQualificationName,
  };
}


function isSouthAfricanNationality(nationality) {
  return String(nationality || '').trim() === 'South African';
}

const GENDER_VALUES = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const APS_BANDS = [
  { min: 80, max: 100, points: 7, label: '80-100' },
  { min: 70, max: 79, points: 6, label: '70-79' },
  { min: 60, max: 69, points: 5, label: '60-69' },
  { min: 50, max: 59, points: 4, label: '50-59' },
  { min: 40, max: 49, points: 3, label: '40-49' },
  { min: 30, max: 39, points: 2, label: '30-39' },
  { min: 0, max: 29, points: 1, label: '0-29' },
];

const SYMBOL_TO_PERCENTAGE = {
  A: 85,
  B: 75,
  C: 65,
  D: 55,
  E: 45,
  F: 35,
  G: 20,
};

function clampPercentage(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  if (num < 0) return 0;
  if (num > 100) return 100;
  return num;
}

function normalizeMark(subject = {}) {
  const explicitPercentage = clampPercentage(subject.percentage);
  if (explicitPercentage !== null) {
    return { percentage: explicitPercentage, source: 'percentage' };
  }

  const symbol = String(subject.symbol || '').trim().toUpperCase();
  if (symbol && Object.prototype.hasOwnProperty.call(SYMBOL_TO_PERCENTAGE, symbol)) {
    return { percentage: SYMBOL_TO_PERCENTAGE[symbol], source: 'symbol', symbol };
  }

  const range = String(subject.range || '').trim();
  const rangeMatch = range.match(/^(\d{1,3})\s*-\s*(\d{1,3})$/);
  if (rangeMatch) {
    const min = clampPercentage(rangeMatch[1]);
    const max = clampPercentage(rangeMatch[2]);
    if (min !== null && max !== null && min <= max) {
      return {
        percentage: Math.round((min + max) / 2),
        source: 'range',
        range: `${min}-${max}`,
      };
    }
  }

  return { percentage: null, source: 'unknown' };
}

function getApsBand(percentage) {
  return APS_BANDS.find((band) => percentage >= band.min && percentage <= band.max) || APS_BANDS[APS_BANDS.length - 1];
}

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
    if (!isValidSouthAfricanIdNumber(id)) {
      throw {
        statusCode: 400,
        message: 'South African ID number is invalid. The check digit (last digit) does not match.',
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
  if (
    isSouthAfricanNationality(payload.nationality) &&
    payload.id_number &&
    !genderMatchesSaId(payload.id_number, gender)
  ) {
    throw {
      statusCode: 400,
      message:
        'Gender must match your SA ID number (digits 7–10: 0000–4999 Female, 5000–9999 Male)',
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

  async findActiveQualificationByCode(qualificationCode, transaction) {
    const code = String(qualificationCode || '').trim().toUpperCase();
    if (!code) return null;
    const [row] = await sequelize.query(
      `SELECT id, code, name
       FROM qualifications
       WHERE UPPER(TRIM(code)) = ?
         AND is_active = true
       LIMIT 1`,
      {
        replacements: [code],
        type: sequelize.QueryTypes.SELECT,
        transaction,
      }
    );
    return row || null;
  }

  async getCampusesForQualification(qualificationId, transaction) {
    if (!qualificationId) return [];
    const campuses = await sequelize.query(
      `SELECT c.id, c.code, c.name, c.city, c.province
       FROM campuses c
       INNER JOIN campus_qualifications cq ON cq.campus_id = c.id
       WHERE cq.qualification_id = ?
         AND cq.is_active = true
         AND c.is_active = true
       ORDER BY c.is_online ASC, c.province ASC, c.city ASC, c.name ASC`,
      {
        replacements: [qualificationId],
        type: sequelize.QueryTypes.SELECT,
        transaction,
      }
    );
    return campuses;
  }

  async resolveCampusAssignment(qualificationId, requestedCampusId, transaction, requireCampus = false) {
    if (!qualificationId) return { campusId: null, campuses: [], campus_mode: 'none' };
    const campuses = await this.getCampusesForQualification(qualificationId, transaction);

    // Only throw error if campus is required (e.g., during payment/submission)
    if (!campuses.length && requireCampus) {
      throw { statusCode: 400, message: 'No active campuses are configured for this qualification' };
    }

    // If no campuses found but not required, return empty state
    if (!campuses.length) {
      return { campusId: null, campuses: [], campus_mode: 'none' };
    }

    if (requestedCampusId) {
      const selected = campuses.find((campus) => String(campus.id) === String(requestedCampusId));
      if (!selected && requireCampus) {
        throw { statusCode: 400, message: 'Selected campus is not valid for this qualification' };
      }
      if (selected) {
        return { campusId: selected.id, campuses, campus_mode: campuses.length === 1 ? 'single' : 'multiple' };
      }
    }

    if (campuses.length === 1) {
      return { campusId: campuses[0].id, campuses, campus_mode: 'single' };
    }

    return { campusId: null, campuses, campus_mode: 'multiple' };
  }

  async checkContactAvailability({
    email,
    phone,
    draft_id,
    id_number,
    passport_number,
  }) {
    const conflicts = await findContactConflicts({
      email,
      phone,
      excludeApplicationId: draft_id || null,
      idNumber: id_number || null,
      passportNumber: passport_number || null,
    });

    return {
      email_available: !conflicts.email,
      phone_available: !conflicts.phone,
      email_conflict: conflicts.email
        ? { source: conflicts.email.source, reference_number: conflicts.email.reference_number || null }
        : null,
      phone_conflict: conflicts.phone
        ? { source: conflicts.phone.source, reference_number: conflicts.phone.reference_number || null }
        : null,
    };
  }

  async ensureUserAccountForSubmittedDraft(draft, studentNumber, temporaryPassword, transaction) {
    const applicantEmail = normalizeEmail(draft.email);
    if (!applicantEmail) {
      throw { statusCode: 400, message: 'Applicant email is required before submission' };
    }

    await assertContactAvailable(
      {
        email: applicantEmail,
        phone: draft.phone,
        excludeApplicationId: draft.id,
        idNumber: draft.id_number,
        passportNumber: draft.passport_number,
      },
      transaction
    );

    const [existingUser] = await sequelize.query(
      `SELECT id, role
       FROM users
       WHERE LOWER(TRIM(email)) = ?
       LIMIT 1`,
      {
        replacements: [applicantEmail],
        type: sequelize.QueryTypes.SELECT,
        transaction,
      }
    );

    const passwordHash = await bcrypt.hash(temporaryPassword, 12);
    let userId = existingUser ? existingUser.id : null;

    if (existingUser) {
      if (existingUser.role !== 'student') {
        throw {
          statusCode: 409,
          message: 'Email already exists on a non-student account. Please contact support.',
        };
      }
      await sequelize.query(
        `UPDATE users
         SET password_hash = ?,
             member_number = ?,
             account_status = 'active',
             is_verified = true,
             is_default_password = true,
             require_password_change = true,
             last_password_change = NOW(),
             updated_at = NOW()
         WHERE id = ?`,
        {
          replacements: [passwordHash, studentNumber, userId],
          transaction,
        }
      );
    } else {
      const [inserted] = await sequelize.query(
        `INSERT INTO users (
           email, password_hash, member_number, role, account_status,
           is_verified, is_default_password, require_password_change, created_at, updated_at
         ) VALUES (
           ?, ?, ?, 'student', 'active',
           true, true, true, NOW(), NOW()
         )
         RETURNING id`,
        {
          replacements: [applicantEmail, passwordHash, studentNumber],
          transaction,
        }
      );
      userId = inserted[0].id;
    }

    await sequelize.query(
      `INSERT INTO user_details (
         user_id, first_name, last_name, date_of_birth, gender, nationality,
         id_number, passport_number, phone, alt_email, street_address, suburb,
         city, province, postal_code, lifecycle_status, created_at, updated_at
       ) VALUES (
         ?, ?, ?, ?, ?, ?,
         ?, ?, ?, ?, ?, ?,
         ?, ?, ?, ?, NOW(), NOW()
       )
       ON CONFLICT (user_id) DO UPDATE
       SET first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           date_of_birth = EXCLUDED.date_of_birth,
           gender = EXCLUDED.gender,
           nationality = EXCLUDED.nationality,
           id_number = EXCLUDED.id_number,
           passport_number = EXCLUDED.passport_number,
           phone = EXCLUDED.phone,
           alt_email = EXCLUDED.alt_email,
           street_address = EXCLUDED.street_address,
           suburb = EXCLUDED.suburb,
           city = EXCLUDED.city,
           province = EXCLUDED.province,
           postal_code = EXCLUDED.postal_code,
           lifecycle_status = EXCLUDED.lifecycle_status,
           updated_at = NOW()`,
      {
        replacements: [
          userId,
          String(draft.first_name || '').trim() || 'Student',
          String(draft.last_name || '').trim() || 'Applicant',
          normalizeDateForUserDetails(draft.date_of_birth),
          draft.gender || null,
          draft.nationality || 'South African',
          isSouthAfricanNationality(draft.nationality) ? String(draft.id_number || '').trim() || null : null,
          isSouthAfricanNationality(draft.nationality) ? null : String(draft.passport_number || '').trim() || null,
          sanitizePhone(draft.phone),
          draft.alt_email ? normalizeEmail(draft.alt_email) : null,
          draft.street_address || null,
          draft.suburb || null,
          draft.city || null,
          draft.province || null,
          draft.postal_code || null,
          'applied',
        ],
        transaction,
      }
    );

    return { userId };
  }

  async findRelatedPartyMatch({ payer_name, payer_phone, payer_email }, transaction) {
    const phone = String(payer_phone || '').trim();
    const email = payer_email ? normalizeEmail(payer_email) : null;
    const name = String(payer_name || '').trim();

    if (!phone && !email) {
      return { status: 'insufficient_data', related_party_id: null };
    }

    const [match] = await sequelize.query(
      `SELECT id, payer_name, payer_phone, payer_email
       FROM applications
       WHERE id IS NOT NULL
         AND (
           (? IS NOT NULL AND LOWER(TRIM(COALESCE(payer_email, ''))) = ?)
           OR
           (? IS NOT NULL AND TRIM(COALESCE(payer_phone, '')) = ?)
         )
       ORDER BY updated_at DESC
       LIMIT 1`,
      {
        replacements: [email, email, phone || null, phone || null],
        type: sequelize.QueryTypes.SELECT,
        transaction,
      }
    );

    if (!match) {
      return { status: 'not_found', related_party_id: null };
    }

    if (name && match.payer_name && name.toLowerCase() !== String(match.payer_name).trim().toLowerCase()) {
      return { status: 'ambiguous', related_party_id: match.id };
    }

    return { status: 'matched', related_party_id: match.id };
  }

  async _loadApplicationWithLabels(applicationId, transaction) {
    const [row] = await sequelize.query(
      `SELECT
         a.*,
         c.code AS campus_code,
         c.name AS campus_name,
         q.code AS resolved_qualification_code,
         q.name AS resolved_qualification_name
       FROM applications a
       LEFT JOIN campuses c ON a.campus_id = c.id
       LEFT JOIN qualifications q ON a.qualification_id = q.id
       WHERE a.id = ?`,
      {
        replacements: [applicationId],
        type: sequelize.QueryTypes.SELECT,
        transaction,
      }
    );

    if (!row) {
      throw { statusCode: 404, message: 'Draft application not found' };
    }
    return row;
  }

  _buildDraftPayload(row) {
    return {
      id: row.id,
      status: row.status,
      draft_id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      phone: row.phone,
      id_number: row.id_number,
      passport_number: row.passport_number,
      date_of_birth: row.date_of_birth,
      gender: row.gender,
      nationality: row.nationality,
      alt_email: row.alt_email,
      street_address: row.street_address,
      suburb: row.suburb,
      city: row.city,
      province: row.province,
      postal_code: row.postal_code,
      high_school: row.high_school,
      high_school_year: row.high_school_year,
      highest_grade: row.highest_grade,
      tertiary_institution: row.tertiary_institution,
      tertiary_qualification: row.tertiary_qualification,
      tertiary_year: row.tertiary_year,
      additional_qualifications: row.additional_qualifications,
      payer_type: row.payer_type || 'self',
      payer_name: row.payer_name,
      payer_relation: row.payer_relation,
      payer_phone: row.payer_phone,
      payer_email: row.payer_email,
      payer_address: row.payer_address,
      popia_accepted: row.popia_accepted,
      popia_accepted_at: row.popia_accepted_at,
      popia_version: row.popia_version,
      related_party_match_status: row.related_party_match_status,
      related_party_id: row.related_party_id,
      qualification_id: row.qualification_id,
      qualification_code: row.resolved_qualification_code || row.qualification_code,
      qualification_name: row.resolved_qualification_name || row.qualification_name,
      campus_id: row.campus_id,
      campus_code: row.campus_code,
      campus_name: row.campus_name,
      application_type: row.application_type,
      admission_for: row.admission_for,
      study_year: row.study_year,
      mark_entries: row.mark_entries,
      aps_result: row.aps_result,
      docs_uploaded: row.docs_uploaded,
      tc_accepted: row.tc_accepted,
      tc_accepted_at: row.tc_accepted_at,
      tc_version: row.tc_version,
      submitted_at: row.submitted_at,
      reference_number: row.reference_number,
      student_number: row.student_number,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  async _findOpenDraftByIdentity({ nationality, id_number, passport_number }, transaction) {
    const normalizedNationality =
      nationality != null && String(nationality).trim()
        ? String(nationality).trim()
        : 'South African';
    const isSa = isSouthAfricanNationality(normalizedNationality);
    const identityValue = isSa
      ? String(id_number || '').trim()
      : String(passport_number || '').trim();

    if (!identityValue) return null;

    const [row] = await sequelize.query(
      `SELECT id
       FROM applications
       WHERE status = ?
         AND (
           (TRIM(COALESCE(nationality, 'South African')) = 'South African' AND id_number = ?)
           OR
           (TRIM(COALESCE(nationality, 'South African')) <> 'South African' AND passport_number = ?)
         )
       ORDER BY updated_at DESC
       LIMIT 1`,
      {
        replacements: [
          APPLICATION_STATUS.DRAFT,
          isSa ? identityValue : null,
          isSa ? null : identityValue,
        ],
        type: sequelize.QueryTypes.SELECT,
        transaction,
      }
    );

    return row || null;
  }

  async checkIdentityStatus({ id_number, passport_number, nationality }) {
    const normalizedNationality =
      nationality != null && String(nationality).trim()
        ? String(nationality).trim()
        : 'South African';
    const isSa = isSouthAfricanNationality(normalizedNationality);
    const identityValue = isSa
      ? String(id_number || '').trim()
      : String(passport_number || '').trim();

    if (!identityValue) {
      throw { statusCode: 400, message: 'Identity value is required' };
    }

    const rows = await sequelize.query(
      `SELECT
         id,
         reference_number,
         student_number,
         status,
         qualification_id,
         qualification_code,
         qualification_name,
         submitted_at,
         created_at,
         updated_at
       FROM applications
       WHERE (
         (TRIM(COALESCE(nationality, 'South African')) = 'South African' AND id_number = ?)
         OR
         (TRIM(COALESCE(nationality, 'South African')) <> 'South African' AND passport_number = ?)
       )
       ORDER BY updated_at DESC
       LIMIT 10`,
      {
        replacements: [isSa ? identityValue : null, isSa ? null : identityValue],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const openDraft = rows.find((row) => row.status === APPLICATION_STATUS.DRAFT) || null;
    const latest = rows[0] || null;

    return {
      identity_type: isSa ? 'id_number' : 'passport_number',
      identity_value: identityValue,
      nationality: normalizedNationality,
      has_records: rows.length > 0,
      has_open_draft: Boolean(openDraft),
      draft_id: openDraft ? openDraft.id : null,
      latest_status: latest ? latest.status : null,
      applications: rows,
    };
  }

  async startOrResumeDraft(payload) {
    const normalizedNationality =
      payload.nationality != null && String(payload.nationality).trim()
        ? String(payload.nationality).trim()
        : 'South African';
    const isSa = isSouthAfricanNationality(normalizedNationality);
    const idNumber = isSa ? String(payload.id_number || '').trim() || null : null;
    const passportNumber = isSa ? null : String(payload.passport_number || '').trim() || null;

    const transaction = await sequelize.transaction();
    try {
      // Try to find existing draft only if we have identity information
      let existing = null;
      if ((isSa && idNumber) || (!isSa && passportNumber)) {
        existing = await this._findOpenDraftByIdentity(
          {
            nationality: normalizedNationality,
            id_number: idNumber,
            passport_number: passportNumber,
          },
          transaction
        );
      }

      if (existing) {
        const row = await this._loadApplicationWithLabels(existing.id, transaction);
        await transaction.commit();
        return {
          draft: this._buildDraftPayload(row),
          resumed: true,
        };
      }

      if (payload.email || payload.phone) {
        await assertContactAvailable(
          {
            email: payload.email,
            phone: payload.phone,
            idNumber,
            passportNumber,
          },
          transaction
        );
      }

      const [inserted] = await sequelize.query(
        `INSERT INTO applications (
          user_id, reference_number, qualification_id, campus_id,
          application_type, status,
          first_name, last_name, email, phone,
          id_number, passport_number, nationality, date_of_birth, gender,
          created_at, updated_at
        ) VALUES (
          NULL, ?, NULL, NULL,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          NOW(), NOW()
        )
        RETURNING id`,
        {
          replacements: [
            null,
            payload.application_type || 'new',
            APPLICATION_STATUS.DRAFT,
            payload.first_name ? String(payload.first_name).trim() : null,
            payload.last_name ? String(payload.last_name).trim() : null,
            payload.email ? normalizeEmail(payload.email) : null,
            payload.phone ? String(payload.phone).trim() : null,
            idNumber,
            passportNumber,
            normalizedNationality,
            payload.date_of_birth || null,
            payload.gender || null,
          ],
          transaction,
        }
      );

      const row = await this._loadApplicationWithLabels(inserted[0].id, transaction);
      await transaction.commit();
      return {
        draft: this._buildDraftPayload(row),
        resumed: false,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getDraftById(draftId) {
    const row = await this._loadApplicationWithLabels(draftId);
    const campuses = row.qualification_id
      ? await this.getCampusesForQualification(row.qualification_id)
      : [];
    return {
      ...this._buildDraftPayload(row),
      campus_options: campuses,
      campus_mode: campuses.length > 1 ? 'multiple' : campuses.length === 1 ? 'single' : 'none',
    };
  }

  async assertDraftAllowsUpload(draftId) {
    const existing = await this._loadApplicationWithLabels(draftId);
    if (existing.status !== APPLICATION_STATUS.DRAFT) {
      throw {
        statusCode: 409,
        message: 'Documents can only be uploaded while the application is still a draft',
      };
    }
    return existing;
  }

  async updateDraft(draftId, payload) {
    const existing = await this._loadApplicationWithLabels(draftId);
    if (existing.status !== APPLICATION_STATUS.DRAFT) {
      throw { statusCode: 409, message: 'Only draft applications can be updated incrementally' };
    }

    const nationality =
      payload.nationality !== undefined
        ? String(payload.nationality || '').trim() || 'South African'
        : String(existing.nationality || '').trim() || 'South African';
    const isSa = isSouthAfricanNationality(nationality);
    const idNumber =
      payload.id_number !== undefined
        ? String(payload.id_number || '').trim() || null
        : existing.id_number;
    const passportNumber =
      payload.passport_number !== undefined
        ? String(payload.passport_number || '').trim() || null
        : existing.passport_number;

    const requestedQualificationId = payload.qualification_id ?? existing.qualification_id;
    const requestedQualificationCode =
      payload.qualification_code ?? existing.qualification_code;
    let qualificationId = requestedQualificationId;
    if (qualificationId) {
      try {
        await this.assertQualificationExists(qualificationId);
      } catch (error) {
        const fallbackQualification = await this.findActiveQualificationByCode(
          requestedQualificationCode
        );
        if (!fallbackQualification) {
          throw {
            statusCode: 400,
            message:
              'Selected qualification is no longer available. Please re-select your qualification.',
          };
        }
        qualificationId = fallbackQualification.id;
      }
    } else if (requestedQualificationCode) {
      const fallbackQualification = await this.findActiveQualificationByCode(
        requestedQualificationCode
      );
      qualificationId = fallbackQualification ? fallbackQualification.id : null;
    }

    let campusId = payload.campus_id ?? existing.campus_id;
    let campusInfo = { campusId, campuses: [], campus_mode: 'none' };
    if (qualificationId) {
      campusInfo = await this.resolveCampusAssignment(
        qualificationId,
        payload.campus_id !== undefined ? payload.campus_id : existing.campus_id,
        null
      );
      campusId = campusInfo.campusId;
    }

    const additionalQualifications =
      payload.additional_qualifications !== undefined
        ? JSON.stringify(payload.additional_qualifications || [])
        : existing.additional_qualifications
          ? JSON.stringify(existing.additional_qualifications)
          : null;

    const markEntries =
      payload.mark_entries !== undefined
        ? JSON.stringify(payload.mark_entries || [])
        : existing.mark_entries
          ? JSON.stringify(existing.mark_entries)
          : null;

    const apsResult =
      payload.aps_result !== undefined
        ? JSON.stringify(payload.aps_result || {})
        : existing.aps_result
          ? JSON.stringify(existing.aps_result)
          : null;

    const payerType = String(payload.payer_type ?? existing.payer_type ?? 'self').toLowerCase();
    const popiaAccepted =
      payload.popia_accepted !== undefined
        ? Boolean(payload.popia_accepted)
        : Boolean(existing.popia_accepted);
    const popiaAcceptedAt =
      popiaAccepted && !existing.popia_accepted
        ? new Date()
        : existing.popia_accepted_at;

    const tcAccepted = payload.tc_accepted !== undefined ? Boolean(payload.tc_accepted) : existing.tc_accepted;
    const tcAcceptedAt =
      tcAccepted && !existing.tc_accepted
        ? new Date()
        : existing.tc_accepted_at;
    const tcVersion = payload.tc_version ?? existing.tc_version ?? '2026.1';
    const popiaVersion = payload.popia_version ?? existing.popia_version ?? '2026.1';

    const relatedParty = await this.findRelatedPartyMatch(
      {
        payer_name: payload.payer_name ?? existing.payer_name,
        payer_phone: payload.payer_phone ?? existing.payer_phone,
        payer_email: payload.payer_email ?? existing.payer_email,
      },
      null
    );

    const nextEmail =
      payload.email !== undefined ? normalizeEmail(payload.email) : existing.email;
    const nextPhone =
      payload.phone !== undefined ? String(payload.phone).trim() : existing.phone;

    if (nextEmail || nextPhone) {
      await assertContactAvailable({
        email: nextEmail,
        phone: nextPhone,
        excludeApplicationId: draftId,
        idNumber: isSa ? idNumber : null,
        passportNumber: isSa ? null : passportNumber,
      });
    }

    await sequelize.query(
      `UPDATE applications SET
        qualification_id = ?,
        campus_id = ?,
        admission_for = ?,
        application_type = ?,
        high_school = ?,
        high_school_year = ?,
        highest_grade = ?,
        tertiary_institution = ?,
        tertiary_qualification = ?,
        tertiary_year = ?,
        additional_qualifications = CAST(? AS jsonb),
        payer_type = ?,
        payer_name = ?,
        payer_relation = ?,
        payer_phone = ?,
        payer_email = ?,
        payer_address = ?,
        popia_accepted = ?,
        popia_accepted_at = ?,
        popia_version = ?,
        related_party_match_status = ?,
        related_party_id = ?,
        first_name = ?,
        last_name = ?,
        email = ?,
        phone = ?,
        id_number = ?,
        passport_number = ?,
        nationality = ?,
        date_of_birth = ?,
        gender = ?,
        alt_email = ?,
        street_address = ?,
        suburb = ?,
        city = ?,
        province = ?,
        postal_code = ?,
        study_year = ?,
        qualification_code = ?,
        qualification_name = ?,
        mark_entries = CAST(? AS jsonb),
        aps_result = CAST(? AS jsonb),
        docs_uploaded = CAST(? AS jsonb),
        tc_accepted = ?,
        tc_accepted_at = ?,
        tc_version = ?,
        updated_at = NOW()
      WHERE id = ?`,
      {
        replacements: [
          qualificationId,
          campusId,
          payload.admission_for ?? existing.admission_for,
          payload.application_type ?? existing.application_type,
          payload.high_school ?? existing.high_school,
          payload.high_school_year ?? existing.high_school_year,
          payload.highest_grade ?? existing.highest_grade,
          payload.tertiary_institution ?? existing.tertiary_institution,
          payload.tertiary_qualification ?? existing.tertiary_qualification,
          payload.tertiary_year ?? existing.tertiary_year,
          additionalQualifications,
          payerType,
          payload.payer_name ?? existing.payer_name,
          payload.payer_relation ?? existing.payer_relation,
          payload.payer_phone ?? existing.payer_phone,
          payload.payer_email ?? existing.payer_email,
          payload.payer_address ?? existing.payer_address,
          popiaAccepted,
          popiaAcceptedAt,
          popiaVersion,
          relatedParty.status,
          relatedParty.related_party_id,
          payload.first_name ?? existing.first_name,
          payload.last_name ?? existing.last_name,
          payload.email !== undefined ? normalizeEmail(payload.email) : existing.email,
          payload.phone ?? existing.phone,
          isSa ? idNumber : null,
          isSa ? null : passportNumber,
          nationality,
          payload.date_of_birth ?? existing.date_of_birth,
          payload.gender ?? existing.gender,
          payload.alt_email !== undefined
            ? payload.alt_email
              ? normalizeEmail(payload.alt_email)
              : null
            : existing.alt_email,
          payload.street_address ?? existing.street_address,
          payload.suburb ?? existing.suburb,
          payload.city ?? existing.city,
          payload.province ?? existing.province,
          payload.postal_code ?? existing.postal_code,
          payload.study_year ?? existing.study_year,
          payload.qualification_code ?? existing.qualification_code,
          payload.qualification_name ?? existing.qualification_name,
          markEntries,
          apsResult,
          payload.docs_uploaded !== undefined
            ? JSON.stringify(payload.docs_uploaded || [])
            : existing.docs_uploaded
              ? JSON.stringify(existing.docs_uploaded)
              : null,
          tcAccepted,
          tcAcceptedAt,
          tcVersion,
          draftId,
        ],
      }
    );

    const row = await this._loadApplicationWithLabels(draftId);
    return {
      ...this._buildDraftPayload(row),
      campus_options: campusInfo.campuses,
      campus_mode: campusInfo.campus_mode,
    };
  }

  async createDraftPaymentIntent(draftId) {
    const draft = await this._loadApplicationWithLabels(draftId);
    if (draft.status !== APPLICATION_STATUS.DRAFT) {
      throw { statusCode: 409, message: 'Payment intent can only be created for draft applications' };
    }

    if (!draft.tc_accepted) {
      throw { statusCode: 400, message: 'Terms and conditions must be accepted before payment' };
    }

    if (!draft.qualification_id) {
      throw { statusCode: 400, message: 'Qualification selection is required before payment' };
    }

    const campuses = await this.getCampusesForQualification(draft.qualification_id);
    if (campuses.length > 1 && !draft.campus_id) {
      throw { statusCode: 400, message: 'Campus selection is required for this qualification' };
    }
    if (campuses.length === 1 && !draft.campus_id) {
      await sequelize.query(
        `UPDATE applications SET campus_id = ?, updated_at = NOW() WHERE id = ?`,
        { replacements: [campuses[0].id, draftId] }
      );
    }

    const payerType = String(draft.payer_type || 'self').toLowerCase();
    if (!draft.payer_name || !draft.payer_phone || !draft.payer_relation) {
      throw { statusCode: 400, message: 'Responsible person linkage fields are required before payment' };
    }
    if (payerType !== 'self') {
      if (!draft.payer_email || !draft.payer_address) {
        throw { statusCode: 400, message: 'Guardian/sponsor payer details require email and address' };
      }
      if (!draft.popia_accepted) {
        throw { statusCode: 400, message: 'POPIA consent is required for guardian/sponsor payer type' };
      }
    }

    await sequelize.query(
      `UPDATE applications
       SET status = ?,
           tc_version = COALESCE(tc_version, ?),
           popia_version = CASE
             WHEN LOWER(COALESCE(payer_type, 'self')) <> 'self'
             THEN COALESCE(popia_version, ?)
             ELSE popia_version
           END,
           updated_at = NOW()
       WHERE id = ?`,
      {
        replacements: [APPLICATION_STATUS.PAYMENT_PENDING, '2026.1', '2026.1', draftId],
      }
    );

    return {
      draft_id: draftId,
      status: APPLICATION_STATUS.PAYMENT_PENDING,
      payment_reference: `PAY-${Date.now()}`,
      amount: 500,
      currency: 'ZAR',
    };
  }

  async confirmDraftPayment(draftId, payload = {}) {
    const draft = await this._loadApplicationWithLabels(draftId);
    if (draft.status !== APPLICATION_STATUS.PAYMENT_PENDING) {
      throw { statusCode: 409, message: 'Payment confirmation requires payment_pending status' };
    }

    const paid = payload.paid !== false;
    if (!paid) {
      await sequelize.query(
        `UPDATE applications SET status = ?, updated_at = NOW() WHERE id = ?`,
        {
          replacements: [APPLICATION_STATUS.DRAFT, draftId],
        }
      );
      return { draft_id: draftId, paid: false, status: APPLICATION_STATUS.DRAFT };
    }

    await sequelize.query(
      `UPDATE applications SET updated_at = NOW() WHERE id = ?`,
      {
        replacements: [draftId],
      }
    );
    return { draft_id: draftId, paid: true, status: APPLICATION_STATUS.PAYMENT_PENDING };
  }

  async submitDraft(draftId) {
    const draft = await this._loadApplicationWithLabels(draftId);
    if (draft.status !== APPLICATION_STATUS.PAYMENT_PENDING) {
      throw { statusCode: 409, message: 'Draft can only be submitted after payment confirmation' };
    }

    if (!draft.tc_accepted) {
      throw { statusCode: 400, message: 'Terms and conditions must be accepted before submit' };
    }

    const generatedReference = draft.reference_number || generateReferenceNumber();
    const submittedAt = new Date();
    const applicationYear =
      draft.created_at && !Number.isNaN(new Date(draft.created_at).getTime())
        ? new Date(draft.created_at).getFullYear()
        : submittedAt.getFullYear();
    const temporaryPassword = generateTemporaryPassword();

    let generatedStudentNumber = draft.student_number || null;
    let linkedUserId = draft.user_id || null;

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const transaction = await sequelize.transaction();
      try {
        if (!generatedStudentNumber) {
          const store = new ApplicationStudentNumberStore(transaction);
          generatedStudentNumber = await generateStudentNumber({
            year: applicationYear,
            role: 1,
            store,
          });
        }

        const account = await this.ensureUserAccountForSubmittedDraft(
          draft,
          generatedStudentNumber,
          temporaryPassword,
          transaction
        );
        linkedUserId = account.userId;

        await sequelize.query(
          `UPDATE applications
           SET status = ?,
               reference_number = ?,
               student_number = ?,
               user_id = ?,
               submitted_at = ?,
               tc_version = COALESCE(tc_version, ?),
               updated_at = NOW()
           WHERE id = ?`,
          {
            replacements: [
              APPLICATION_STATUS.APPLIED,
              generatedReference,
              generatedStudentNumber,
              linkedUserId,
              submittedAt,
              '2026.1',
              draftId,
            ],
            transaction,
          }
        );

        await transaction.commit();
        break;
      } catch (error) {
        await transaction.rollback();
        const isUniqueViolation =
          error?.name === 'SequelizeUniqueConstraintError' || error?.original?.code === '23505';
        if (!draft.student_number && isUniqueViolation && attempt < 9) {
          generatedStudentNumber = null;
          continue;
        }
        throw error;
      }
    }

    if (!generatedStudentNumber) {
      throw new Error('Could not generate unique number after 10 attempts');
    }

    const finalRow = await this._loadApplicationWithLabels(draftId);
    const outcome = decideAdmissionsEmailOutcome(finalRow);
    let emailSent = false;
    try {
      const emailResult = await emailService.sendAdmissionsOutcomeEmail({
        to: finalRow.email,
        fullName: `${finalRow.first_name || ''} ${finalRow.last_name || ''}`.trim(),
        studentNumber: generatedStudentNumber || finalRow.student_number || null,
        qualificationName:
          finalRow.resolved_qualification_name || finalRow.qualification_name || null,
        admittedFor: finalRow.admission_for,
        submittedAt: finalRow.submitted_at,
        loginEmail: finalRow.email,
        temporaryPassword,
        decision: outcome.decision,
        suggestionQualification: outcome.suggestion,
        rejectionReason: finalRow.rejection_reason || null,
        nationality: finalRow.nationality,
      });
      emailSent = Boolean(emailResult?.sent);
    } catch (emailError) {
      console.error('[ApplicationService] Failed to send admissions email:', emailError?.message || emailError);
    }

    return {
      id: finalRow.id,
      user_id: linkedUserId,
      reference_number: finalRow.reference_number,
      student_number: finalRow.student_number,
      student_number_formatted: finalRow.student_number ? formatNumber(finalRow.student_number) : null,
      status: finalRow.status,
      submitted_at: finalRow.submitted_at,
      email_sent: emailSent,
    };
  }

  _isPostgraduateQualification(qualificationName) {
    const label = String(qualificationName || '').toLowerCase();
    return (
      label.includes('honours') ||
      label.includes('postgraduate') ||
      label.includes('master')
    );
  }

  _classifyEligibility(qualificationName, studyLevel, apsScore, hasMath, hasPriorQualification) {
    const label = String(qualificationName || '').toLowerCase();
    const postgraduate = this._isPostgraduateQualification(label);
    const wantsPostgraduate = String(studyLevel || 'undergraduate').toLowerCase() === 'postgraduate';
    const reasons = [];

    if (postgraduate && !wantsPostgraduate) {
      reasons.push('This is a postgraduate qualification');
    }
    if (!postgraduate && wantsPostgraduate) {
      reasons.push('This qualification is undergraduate-level');
    }

    if (postgraduate && !hasPriorQualification) {
      reasons.push('Prior tertiary qualification is required for postgraduate study');
    }

    const minAps = postgraduate ? 5 : label.includes('higher certificate') ? 2 : 3;
    if (apsScore < minAps) {
      reasons.push(`APS below minimum threshold (${minAps})`);
    }

    if (label.includes('information technology') && !hasMath) {
      reasons.push('Mathematics required, Math Literacy may not be accepted for IT');
    }

    if (!reasons.length) {
      return { status: 'recommended', reasons: [] };
    }
    if (reasons.length <= 2) {
      return { status: 'possibly_eligible', reasons };
    }
    return { status: 'not_eligible', reasons };
  }

  async evaluateApsEligibility(payload = {}) {
    const subjects = Array.isArray(payload.subjects) ? payload.subjects : [];
    const scoredSubjects = subjects
      .map((subject) => {
        const normalized = normalizeMark(subject);
        if (normalized.percentage == null) {
          return {
            name: subject.name || subject.subject || 'Unknown subject',
            aps_points: null,
            resolved_percentage: null,
            source: normalized.source,
            ignored: true,
            reason: 'Unrecognized mark format',
          };
        }
        const band = getApsBand(normalized.percentage);
        const name = String(subject.name || subject.subject || '').trim() || 'Unknown subject';
        const lifeOrientation = name.toLowerCase() === 'life orientation';
        return {
          name,
          aps_points: band.points,
          resolved_percentage: normalized.percentage,
          source: normalized.source,
          source_symbol: normalized.symbol || null,
          source_range: normalized.range || null,
          band: band.label,
          ignored: lifeOrientation,
          reason: lifeOrientation ? 'Excluded from APS core total' : null,
        };
      })
      .filter((item) => item.name);

    const apsEligible = scoredSubjects
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.aps_points != null && !item.ignored);

    const topSixIndices = new Set(
      apsEligible
        .sort(
          (a, b) =>
            b.item.aps_points - a.item.aps_points ||
            b.item.resolved_percentage - a.item.resolved_percentage
        )
        .slice(0, 6)
        .map(({ index }) => index)
    );

    const subjectBreakdown = scoredSubjects.map((item, index) => ({
      ...item,
      counted_in_aps: topSixIndices.has(index),
    }));

    const apsScore = subjectBreakdown
      .filter((item) => item.counted_in_aps)
      .reduce((total, subject) => total + subject.aps_points, 0);

    const hasMath = subjectBreakdown.some((subject) => {
      const label = subject.name.toLowerCase();
      return (
        label === 'mathematics' ||
        label === 'maths' ||
        label.includes('pure mathematics')
      );
    });

    const hasPriorQualification =
      Array.isArray(payload.additional_qualifications) &&
      payload.additional_qualifications.some((entry) => {
        const status = String(entry?.study_status || '').toLowerCase();
        return ['completed', 'in progress', 'in_progress'].includes(status);
      });

    const qualifications = await sequelize.query(
      `SELECT q.id, q.code, q.name,
              COALESCE(
                json_agg(
                  DISTINCT jsonb_build_object(
                    'id', c.id,
                    'code', c.code,
                    'name', c.name,
                    'city', c.city,
                    'province', c.province
                  )
                ) FILTER (WHERE c.id IS NOT NULL),
                '[]'::json
              ) AS campuses
       FROM qualifications
       q
       LEFT JOIN campus_qualifications cq ON cq.qualification_id = q.id AND cq.is_active = true
       LEFT JOIN campuses c ON c.id = cq.campus_id AND c.is_active = true
       WHERE q.is_active = true
       GROUP BY q.id, q.code, q.name
       ORDER BY q.name ASC`,
      { type: sequelize.QueryTypes.SELECT }
    );

    const eligibility = qualifications.map((qualification) => {
      const result = this._classifyEligibility(
        qualification.name,
        payload.study_level,
        apsScore,
        hasMath,
        hasPriorQualification
      );
      return {
        qualification_id: qualification.id,
        qualification_code: qualification.code,
        qualification_name: qualification.name,
        campus_options: qualification.campuses || [],
        campus_mode:
          (qualification.campuses || []).length > 1
            ? 'multiple'
            : (qualification.campuses || []).length === 1
              ? 'single'
              : 'none',
        status: result.status,
        reasons: result.reasons,
      };
    });

    return {
      aps_score: apsScore,
      subject_breakdown: subjectBreakdown,
      recommended: eligibility.filter((item) => item.status === 'recommended'),
      possibly_eligible: eligibility.filter((item) => item.status === 'possibly_eligible'),
      not_eligible: eligibility.filter((item) => item.status === 'not_eligible'),
    };
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
          AND status IN (?, ?, ?, ?, ?)`,
        {
          replacements: [
            qualificationId,
            id,
            APPLICATION_STATUS.DRAFT,
            APPLICATION_STATUS.PAYMENT_PENDING,
            APPLICATION_STATUS.APPLIED,
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
         AND status IN (?, ?, ?, ?, ?)`,
      {
        replacements: [
          qualificationId,
          pass,
          APPLICATION_STATUS.DRAFT,
          APPLICATION_STATUS.PAYMENT_PENDING,
          APPLICATION_STATUS.APPLIED,
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
        passport_number,
        nationality = 'South African',
        date_of_birth,
        gender,
        alt_email,
        street_address,
        suburb,
        city,
        province,
        postal_code,
        study_year,
        qualification_code,
        qualification_name,
        docs_uploaded,
        tc_accepted,
        status = APPLICATION_STATUS.DRAFT,
      } = payload;

      if (!campus_id || !qualification_id) {
        await transaction.rollback();
        throw { statusCode: 400, message: 'campus_id and qualification_id are required' };
      }

      if (!first_name || !last_name || !email || !phone) {
        await transaction.rollback();
        throw {
          statusCode: 400,
          message:
            'first_name, last_name, email, and phone are required',
        };
      }

      assertIdentityForSubmit(nationality, id_number, passport_number);

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
        nationality,
        id_number,
        passport_number,
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
        nationality,
        id_number,
        passport_number,
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

      await assertContactAvailable(
        {
          email,
          phone,
          idNumber: id_number,
          passportNumber: passport_number,
        },
        transaction
      );

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
      const docsJson =
        docs_uploaded == null
          ? null
          : typeof docs_uploaded === 'string'
            ? docs_uploaded
            : JSON.stringify(docs_uploaded);

      const [results] = await sequelize.query(
        `INSERT INTO applications (
          user_id, reference_number, qualification_id, campus_id,
          admission_for, application_type,
          high_school, high_school_year, highest_grade, matric_subjects,
          tertiary_institution, tertiary_qualification, tertiary_year,
          payer_name, payer_relation, payer_phone, payer_email, payer_address,
          status, tc_accepted, tc_accepted_at, submitted_at,
          first_name, last_name, email, phone, id_number,
          passport_number, nationality, date_of_birth, gender, alt_email,
          street_address, suburb, city, province, postal_code,
          study_year, qualification_code, qualification_name, docs_uploaded,
          created_at, updated_at
        ) VALUES (
          NULL, ?, ?, ?, ?, ?,
          ?, ?, ?, CAST(? AS jsonb),
          ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
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
            id_number ? String(id_number).trim() : null,
            passport_number ? String(passport_number).trim() : null,
            String(nationality || 'South African').trim(),
            date_of_birth || null,
            gender || null,
            alt_email ? normalizeEmail(alt_email) : null,
            street_address || null,
            suburb || null,
            city || null,
            province || null,
            postal_code || null,
            study_year ?? null,
            qualification_code || null,
            qualification_name || null,
            docsJson,
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
         a.student_number,
         a.admission_for, a.application_type,
         a.high_school, a.high_school_year, a.highest_grade, a.matric_subjects,
         a.tertiary_institution, a.tertiary_qualification, a.tertiary_year, a.additional_qualifications,
         a.payer_type, a.payer_name, a.payer_relation, a.payer_phone, a.payer_email, a.payer_address,
         a.popia_accepted, a.popia_accepted_at, a.popia_version,
         a.related_party_match_status, a.related_party_id,
         a.status, a.tc_accepted, a.tc_accepted_at, a.submitted_at, a.rejection_reason,
         a.tc_version,
         a.reviewed_at, a.created_at, a.updated_at,
         a.first_name, a.last_name, a.email, a.phone, a.id_number,
         a.passport_number, a.nationality, a.date_of_birth, a.gender, a.alt_email,
         a.street_address, a.suburb, a.city, a.province, a.postal_code,
         a.study_year, a.docs_uploaded, a.mark_entries, a.aps_result,
         a.qualification_code AS stored_qualification_code,
         a.qualification_name AS stored_qualification_name,
         c.code AS campus_code, c.name AS campus_name, c.city AS campus_city,
         COALESCE(q.code, a.qualification_code) AS qualification_code,
         COALESCE(q.name, a.qualification_name) AS qualification_name
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
         a.student_number,
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
        nationalityMerged,
        idNumber,
        passportNumber,
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
        nationalityMerged,
        idNumber,
        passportNumber,
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
          passport_number = ?,
          nationality = ?,
          date_of_birth = ?,
          gender = ?,
          alt_email = ?,
          street_address = ?,
          suburb = ?,
          city = ?,
          province = ?,
          postal_code = ?,
          study_year = ?,
          qualification_code = ?,
          qualification_name = ?,
          docs_uploaded = CAST(? AS jsonb),
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
            idForDb,
            passForDb,
            nationalityMerged,
            payload.date_of_birth !== undefined
              ? payload.date_of_birth
              : existing.date_of_birth,
            payload.gender !== undefined ? payload.gender : existing.gender,
            altEmailNorm,
            payload.street_address !== undefined
              ? payload.street_address
              : existing.street_address,
            payload.suburb !== undefined ? payload.suburb : existing.suburb,
            payload.city !== undefined ? payload.city : existing.city,
            payload.province !== undefined ? payload.province : existing.province,
            payload.postal_code !== undefined
              ? payload.postal_code
              : existing.postal_code,
            payload.study_year !== undefined ? payload.study_year : existing.study_year,
            payload.qualification_code !== undefined
              ? payload.qualification_code
              : existing.stored_qualification_code,
            payload.qualification_name !== undefined
              ? payload.qualification_name
              : existing.stored_qualification_name,
            docsMerged,
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
         a.student_number,
         a.admission_for, a.application_type,
         a.high_school, a.high_school_year, a.highest_grade, a.matric_subjects,
         a.tertiary_institution, a.tertiary_qualification, a.tertiary_year, a.additional_qualifications,
         a.payer_type, a.payer_name, a.payer_relation, a.payer_phone, a.payer_email, a.payer_address,
         a.popia_accepted, a.popia_accepted_at, a.popia_version,
         a.related_party_match_status, a.related_party_id,
         a.status, a.tc_accepted, a.tc_accepted_at, a.submitted_at, a.rejection_reason,
         a.tc_version,
         a.reviewed_at, a.reviewed_by, a.approved_at, a.created_at, a.updated_at,
         a.first_name, a.last_name, a.email, a.phone, a.id_number,
         a.nationality, a.passport_number, a.date_of_birth, a.gender, a.alt_email,
         a.street_address, a.suburb, a.city, a.province, a.postal_code,
         a.study_year, a.docs_uploaded, a.mark_entries, a.aps_result,
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
        `(a.first_name ILIKE ? OR a.last_name ILIKE ? OR a.email ILIKE ? OR a.reference_number ILIKE ? OR a.student_number ILIKE ? OR a.id_number ILIKE ? OR a.passport_number ILIKE ?)`
      );
      replacements.push(term, term, term, term, term, term, term);
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

    const updatedApplication = await this.getApplicationByIdAdmin(applicationId);

    // Log audit for application status change
    const actionType = status === APPLICATION_STATUS.APPROVED ? 'APPROVE' :
                       status === APPLICATION_STATUS.REJECTED ? 'REJECT' : 'UPDATE';
    await AuditService.logApplicationAction(
      reviewerUserId,
      applicationId,
      actionType,
      existing.status,
      status,
      rejectionReason
    );

    // Send email notification for approved/rejected status changes
    if (status === APPLICATION_STATUS.APPROVED || status === APPLICATION_STATUS.REJECTED) {
      const fullName = `${updatedApplication.first_name || ''} ${updatedApplication.last_name || ''}`.trim();

      try {
        if (status === APPLICATION_STATUS.APPROVED) {
          await emailService.sendApplicationApprovedEmail({
            to: updatedApplication.email,
            fullName,
            referenceNumber: updatedApplication.reference_number,
            studentNumber: updatedApplication.student_number,
            qualificationName: updatedApplication.qualification_name,
            campusName: updatedApplication.campus_name,
            reviewedAt: updatedApplication.reviewed_at,
          });
        } else if (status === APPLICATION_STATUS.REJECTED) {
          await emailService.sendApplicationRejectedEmail({
            to: updatedApplication.email,
            fullName,
            referenceNumber: updatedApplication.reference_number,
            qualificationName: updatedApplication.qualification_name,
            campusName: updatedApplication.campus_name,
            rejectionReason: updatedApplication.rejection_reason,
            reviewedAt: updatedApplication.reviewed_at,
          });
        }
      } catch (emailError) {
        console.error(
          `[ApplicationService] Failed to send ${status} notification email:`,
          emailError?.message || emailError
        );
        // Don't throw - email failure should not prevent status update
      }
    }

    // Auto-allocate all Year 1 Semester 1 modules when application is approved
    if (status === APPLICATION_STATUS.APPROVED) {
      try {
        await this.autoAllocateModules(updatedApplication);
      } catch (autoAllocError) {
        console.error(
          '[ApplicationService] Failed to auto-allocate modules:',
          autoAllocError?.message || autoAllocError
        );
        // Don't throw - allocation failure should not prevent approval
      }
    }

    return updatedApplication;
  }

  /**
   * Auto-allocate all modules for Year 1, Semester 1 when application is approved
   */
  async autoAllocateModules(application) {
    // Get the student's qualification
    const qualificationModules = await sequelize.query(
      `SELECT id, code, name, credits, year, semester
       FROM modules
       WHERE qualification_id = :qualId
         AND year = 1
         AND semester = 1
         AND is_active = true
       ORDER BY code ASC`,
      {
        replacements: { qualId: application.qualification_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (qualificationModules.length === 0) {
      console.log(`[ApplicationService] No Year 1 Semester 1 modules found for qualification ${application.qualification_id}`);
      return;
    }

    // Get active semester
    const activeSemester = await sequelize.query(
      `SELECT id FROM semesters WHERE is_active = true ORDER BY start_date DESC LIMIT 1`,
      { type: sequelize.QueryTypes.SELECT }
    );

    if (!activeSemester || activeSemester.length === 0) {
      console.log('[ApplicationService] No active semester found for auto-allocation');
      return;
    }

    const semesterId = activeSemester[0].id;

    // Get student ID from application
    const studentRecord = await sequelize.query(
      `SELECT id FROM students WHERE id = :studentId`,
      {
        replacements: { studentId: application.student_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!studentRecord || studentRecord.length === 0) {
      console.log(`[ApplicationService] Student record not found: ${application.student_id}`);
      return;
    }

    const studentId = studentRecord[0].id;

    // Register each module
    const { v4: uuidv4 } = require('uuid');
    for (const module of qualificationModules) {
      try {
        // Check if already registered
        const existing = await sequelize.query(
          `SELECT id FROM registrations
           WHERE student_id = :studentId
           AND module_id = :moduleId
           AND semester_id = :semesterId`,
          {
            replacements: { studentId, moduleId: module.id, semesterId },
            type: sequelize.QueryTypes.SELECT,
          }
        );

        if (existing && existing.length > 0) {
          console.log(`[ApplicationService] Module ${module.code} already registered for student`);
          continue;
        }

        // Create registration
        await sequelize.query(
          `INSERT INTO registrations (id, student_id, module_id, semester_id, status, created_at, updated_at)
           VALUES (:id, :studentId, :moduleId, :semesterId, 'approved', NOW(), NOW())`,
          {
            replacements: {
              id: uuidv4(),
              studentId,
              moduleId: module.id,
              semesterId,
            },
          }
        );

        console.log(`[ApplicationService] Auto-allocated module ${module.code} to student ${studentId}`);
      } catch (error) {
        console.error(`[ApplicationService] Failed to allocate module ${module.code}:`, error.message);
        // Continue with next module
      }
    }

    console.log(`[ApplicationService] Auto-allocated ${qualificationModules.length} modules for student ${studentId}`);

    // Send module allocation email
    if (qualificationModules.length > 0) {
      try {
        const fullName = `${application.first_name || ''} ${application.last_name || ''}`.trim();
        const semesterInfo = await sequelize.query(
          `SELECT name FROM semesters WHERE id = :semesterId`,
          {
            replacements: { semesterId },
            type: sequelize.QueryTypes.SELECT,
          }
        );

        await emailService.sendModuleAllocationEmail({
          to: application.email,
          fullName,
          studentNumber: application.student_number,
          modules: qualificationModules,
          qualificationName: application.qualification_name || 'Your selected qualification',
          semester: semesterInfo[0]?.name || 'Current Semester',
        });

        console.log(`[ApplicationService] Module allocation email sent to ${application.email}`);
      } catch (emailError) {
        console.error('[ApplicationService] Failed to send module allocation email:', emailError?.message);
        // Don't throw - email failure should not prevent module allocation
      }
    }
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
