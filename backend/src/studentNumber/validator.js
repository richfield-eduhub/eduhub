const { verifyLuhn } = require('./luhn');

const ROLE_MAP = Object.freeze({
  1: 'Student',
  2: 'Lecturer',
  3: 'Admin',
  4: 'Contractor',
  5: 'Reserved',
});

function parseResult(value) {
  const year = value.slice(0, 2);
  const role = Number(value.slice(2, 3));
  const sequence = value.slice(3, 9);
  const checkDigit = value.slice(9, 10);

  return {
    year,
    role,
    roleName: ROLE_MAP[role],
    sequence,
    checkDigit,
  };
}

function validateStudentNumber(input) {
  const normalized = String(input || '').replace(/-/g, '');

  if (normalized.length !== 10) {
    return { valid: false, error: 'Invalid length: expected 10 digits', parsed: null };
  }

  if (!/^\d+$/.test(normalized)) {
    return { valid: false, error: 'Invalid format: digits only', parsed: null };
  }

  const role = Number(normalized.slice(2, 3));
  if (role < 1 || role > 5) {
    return { valid: false, error: 'Invalid role code: must be 1-5', parsed: null };
  }

  if (!verifyLuhn(normalized)) {
    return { valid: false, error: 'Invalid check digit', parsed: null };
  }

  return {
    valid: true,
    error: null,
    parsed: parseResult(normalized),
  };
}

module.exports = {
  validateStudentNumber,
  ROLE_MAP,
};
