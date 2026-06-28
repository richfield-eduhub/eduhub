/**
 * South African 13-digit ID validation (checksum on the last digit).
 * Algorithm: sum odd-position digits (1st, 3rd, …), double concatenated even digits and sum their digits, then mod-10 check.
 */

function sumDigits(value) {
  return String(value)
    .split('')
    .reduce((total, digit) => total + Number(digit), 0);
}

function isValidSouthAfricanIdNumber(idNumber) {
  const digits = String(idNumber || '').replace(/\D/g, '');
  if (!/^\d{13}$/.test(digits)) return false;

  let oddSum = 0;
  let evenDigits = '';

  for (let i = 0; i < 12; i += 1) {
    if (i % 2 === 0) {
      oddSum += Number(digits[i]);
    } else {
      evenDigits += digits[i];
    }
  }

  const total = oddSum + sumDigits(Number(evenDigits) * 2);
  const checkDigit = (10 - (total % 10)) % 10;
  return checkDigit === Number(digits[12]);
}

/** Digits 7–10: 0000–4999 = Female, 5000–9999 = Male */
function deriveGenderFromSaId(idNumber) {
  const digits = String(idNumber || '').replace(/\D/g, '');
  if (digits.length < 10) return null;
  const sequence = Number(digits.slice(6, 10));
  if (!Number.isFinite(sequence)) return null;
  return sequence < 5000 ? 'Female' : 'Male';
}

function genderMatchesSaId(idNumber, gender) {
  const derived = deriveGenderFromSaId(idNumber);
  if (!derived) return false;
  return String(gender || '').trim() === derived;
}

module.exports = {
  isValidSouthAfricanIdNumber,
  deriveGenderFromSaId,
  genderMatchesSaId,
};
