const crypto = require('crypto');
const { computeCheckDigit } = require('./luhn');

function validateInputs(year, role) {
  if (!Number.isInteger(year) || year < 1000 || year > 9999) {
    throw new Error('Invalid year');
  }
  if (!Number.isInteger(role) || role < 1 || role > 5) {
    throw new Error('Invalid role code: must be 1-5');
  }
}

function randomSequenceDigits() {
  const max = 1_000_000;
  const value = crypto.randomInt(0, max);
  return String(value).padStart(6, '0');
}

async function generateStudentNumber({ year, role, store }) {
  validateInputs(year, role);
  if (!store || typeof store.has !== 'function' || typeof store.add !== 'function') {
    throw new Error('Invalid store');
  }

  const yearSegment = String(year).slice(-2);
  const roleSegment = String(role);

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const sequence = randomSequenceDigits();
    const firstNine = `${yearSegment}${roleSegment}${sequence}`;
    const checkDigit = computeCheckDigit(firstNine);
    const fullNumber = `${firstNine}${checkDigit}`;
    const exists = await store.has(fullNumber);
    if (exists) continue;
    await store.add(fullNumber);
    return fullNumber;
  }

  throw new Error('Could not generate unique number after 10 attempts');
}

function formatNumber(rawNumber) {
  const normalized = String(rawNumber || '').replace(/-/g, '');
  if (!/^\d{10}$/.test(normalized)) return normalized;
  return `${normalized.slice(0, 2)}-${normalized.slice(2, 3)}-${normalized.slice(3, 9)}-${normalized.slice(9, 10)}`;
}

module.exports = {
  generateStudentNumber,
  formatNumber,
};
