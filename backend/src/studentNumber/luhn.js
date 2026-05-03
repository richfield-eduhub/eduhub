function computeCheckDigit(numberString) {
  const base = String(numberString || '');
  if (!/^\d{9}$/.test(base)) {
    throw new Error('computeCheckDigit expects a 9-digit numeric string');
  }

  const withTrailingZero = `${base}0`;
  const checkDigit = (10 - luhnSum(withTrailingZero) % 10) % 10;
  return String(checkDigit);
}

function verifyLuhn(fullNumberString) {
  const value = String(fullNumberString || '');
  if (!/^\d{10}$/.test(value)) return false;
  return luhnSum(value) % 10 === 0;
}

function luhnSum(digitString) {
  let sum = 0;
  let shouldDouble = false;

  for (let i = digitString.length - 1; i >= 0; i -= 1) {
    let digit = Number(digitString[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum;
}

module.exports = {
  computeCheckDigit,
  verifyLuhn,
};
