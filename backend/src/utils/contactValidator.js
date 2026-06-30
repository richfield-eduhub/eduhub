/**
 * Email and phone uniqueness checks across users and applications.
 */

const sequelize = require('../config/database');

function normalizeContactEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length >= 9) return digits.slice(-9);
  return digits;
}

function phoneSqlExpression(column) {
  return `CASE
    WHEN LENGTH(REGEXP_REPLACE(COALESCE(${column}, ''), '[^0-9]', '', 'g')) >= 9
      THEN RIGHT(REGEXP_REPLACE(COALESCE(${column}, ''), '[^0-9]', '', 'g'), 9)
    ELSE REGEXP_REPLACE(COALESCE(${column}, ''), '[^0-9]', '', 'g')
  END`;
}

function buildSameApplicantClause({ idColumn, passportColumn, idParam, passportParam }) {
  return `(
    (:${idParam} IS NOT NULL AND :${idParam} <> '' AND TRIM(COALESCE(${idColumn}, '')) = :${idParam})
    OR (:${passportParam} IS NOT NULL AND :${passportParam} <> '' AND TRIM(COALESCE(${passportColumn}, '')) = :${passportParam})
  )`;
}

async function findContactConflicts(
  {
    email,
    phone,
    excludeApplicationId = null,
    excludeUserId = null,
    idNumber = null,
    passportNumber = null,
  },
  transaction = null
) {
  const conflicts = { email: null, phone: null };
  const normalizedEmail = email ? normalizeContactEmail(email) : null;
  const normalizedPhone = phone ? normalizePhone(phone) : null;
  const id = idNumber ? String(idNumber).trim() : null;
  const passport = passportNumber ? String(passportNumber).trim() : null;

  const queryOptions = {
    type: sequelize.QueryTypes.SELECT,
    transaction,
  };

  if (normalizedEmail) {
    const sameApplicant = buildSameApplicantClause({
      idColumn: 'ud.id_number',
      passportColumn: 'ud.passport_number',
      idParam: 'idNumber',
      passportParam: 'passportNumber',
    });

    const [userConflict] = await sequelize.query(
      `SELECT u.id AS user_id, u.email, 'user' AS source
       FROM users u
       INNER JOIN user_details ud ON u.id = ud.user_id
       WHERE LOWER(TRIM(u.email)) = :email
         AND (:excludeUserId IS NULL OR u.id::text <> :excludeUserId)
         AND NOT ${sameApplicant}
       LIMIT 1`,
      {
        ...queryOptions,
        replacements: {
          email: normalizedEmail,
          excludeUserId: excludeUserId ? String(excludeUserId) : null,
          idNumber: id,
          passportNumber: passport,
        },
      }
    );

    if (userConflict) {
      conflicts.email = userConflict;
    } else {
      const sameAppApplicant = buildSameApplicantClause({
        idColumn: 'id_number',
        passportColumn: 'passport_number',
        idParam: 'idNumber',
        passportParam: 'passportNumber',
      });

      const [applicationConflict] = await sequelize.query(
        `SELECT id, email, reference_number, status, 'application' AS source
         FROM applications
         WHERE LOWER(TRIM(email)) = :email
           AND (:excludeApplicationId IS NULL OR id::text <> :excludeApplicationId)
           AND NOT ${sameAppApplicant}
         LIMIT 1`,
        {
          ...queryOptions,
          replacements: {
            email: normalizedEmail,
            excludeApplicationId: excludeApplicationId ? String(excludeApplicationId) : null,
            idNumber: id,
            passportNumber: passport,
          },
        }
      );

      if (applicationConflict) {
        conflicts.email = applicationConflict;
      }
    }
  }

  if (normalizedPhone) {
    const phoneExpr = phoneSqlExpression('ud.phone');
    const sameApplicant = buildSameApplicantClause({
      idColumn: 'ud.id_number',
      passportColumn: 'ud.passport_number',
      idParam: 'idNumber',
      passportParam: 'passportNumber',
    });

    const [userPhoneConflict] = await sequelize.query(
      `SELECT ud.user_id, ud.phone, 'user' AS source
       FROM user_details ud
       WHERE ${phoneExpr} = :phone
         AND (:excludeUserId IS NULL OR ud.user_id::text <> :excludeUserId)
         AND NOT ${sameApplicant}
       LIMIT 1`,
      {
        ...queryOptions,
        replacements: {
          phone: normalizedPhone,
          excludeUserId: excludeUserId ? String(excludeUserId) : null,
          idNumber: id,
          passportNumber: passport,
        },
      }
    );

    if (userPhoneConflict) {
      conflicts.phone = userPhoneConflict;
    } else {
      const appPhoneExpr = phoneSqlExpression('phone');
      const sameAppApplicant = buildSameApplicantClause({
        idColumn: 'id_number',
        passportColumn: 'passport_number',
        idParam: 'idNumber',
        passportParam: 'passportNumber',
      });

      const [applicationPhoneConflict] = await sequelize.query(
        `SELECT id, phone, reference_number, status, 'application' AS source
         FROM applications
         WHERE ${appPhoneExpr} = :phone
           AND (:excludeApplicationId IS NULL OR id::text <> :excludeApplicationId)
           AND NOT ${sameAppApplicant}
         LIMIT 1`,
        {
          ...queryOptions,
          replacements: {
            phone: normalizedPhone,
            excludeApplicationId: excludeApplicationId ? String(excludeApplicationId) : null,
            idNumber: id,
            passportNumber: passport,
          },
        }
      );

      if (applicationPhoneConflict) {
        conflicts.phone = applicationPhoneConflict;
      }
    }
  }

  return conflicts;
}

async function assertContactAvailable(options, transaction = null) {
  const conflicts = await findContactConflicts(options, transaction);

  if (conflicts.email) {
    throw {
      statusCode: 409,
      message:
        'This email address is already in use by another user. Please use a different email or log in to your existing account.',
      field: 'email',
    };
  }

  if (conflicts.phone) {
    throw {
      statusCode: 409,
      message:
        'This phone number is already in use by another user. Please use a different number or contact admissions.',
      field: 'phone',
    };
  }
}

module.exports = {
  normalizeContactEmail,
  normalizePhone,
  findContactConflicts,
  assertContactAvailable,
};
