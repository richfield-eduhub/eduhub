const { generateStudentNumber, formatNumber } = require('../../src/studentNumber/generator');
const { validateStudentNumber, ROLE_MAP } = require('../../src/studentNumber/validator');
const { computeCheckDigit } = require('../../src/studentNumber/luhn');

function buildValidNumber(year = 2026, role = 1, sequence = '000001') {
  const yearSegment = String(year).slice(-2);
  const base = `${yearSegment}${role}${sequence}`;
  return `${base}${computeCheckDigit(base)}`;
}

describe('Student number generator', () => {
  it('generates a unique 10-digit student number', async () => {
    const store = {
      numbers: new Set(),
      has: async (n) => store.numbers.has(n),
      add: async (n) => { store.numbers.add(n); },
    };

    const number = await generateStudentNumber({ year: 2026, role: 1, store });
    expect(number).toMatch(/^\d{10}$/);
    expect(validateStudentNumber(number).valid).toBe(true);
    expect(store.numbers.has(number)).toBe(true);
  });

  it('retries when number already exists', async () => {
    const existing = buildValidNumber();
    const store = {
      numbers: new Set([existing]),
      has: async (n) => store.numbers.has(n),
      add: async (n) => { store.numbers.add(n); },
    };

    const number = await generateStudentNumber({ year: 2026, role: 1, store });
    expect(number).not.toBe(existing);
  });

  it('rejects invalid year', async () => {
    const store = { has: async () => false, add: async () => {} };
    await expect(generateStudentNumber({ year: 99, role: 1, store }))
      .rejects.toThrow('Invalid year');
  });

  it('rejects invalid role', async () => {
    const store = { has: async () => false, add: async () => {} };
    await expect(generateStudentNumber({ year: 2026, role: 9, store }))
      .rejects.toThrow('Invalid role code');
  });

  it('rejects invalid store', async () => {
    await expect(generateStudentNumber({ year: 2026, role: 1, store: null }))
      .rejects.toThrow('Invalid store');
  });
});

describe('formatNumber', () => {
  it('formats 10-digit number with dashes', () => {
    const raw = buildValidNumber();
    expect(formatNumber(raw)).toBe(
      `${raw.slice(0, 2)}-${raw.slice(2, 3)}-${raw.slice(3, 9)}-${raw.slice(9, 10)}`
    );
  });

  it('accepts already dashed input', () => {
    const raw = buildValidNumber();
    const dashed = formatNumber(raw);
    expect(formatNumber(dashed)).toBe(dashed);
  });
});

describe('validateStudentNumber', () => {
  it('validates a correctly formed student number', () => {
    const number = buildValidNumber(2026, 1, '123456');
    const result = validateStudentNumber(number);
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
    expect(result.parsed.role).toBe(1);
    expect(result.parsed.roleName).toBe(ROLE_MAP[1]);
    expect(result.parsed.year).toBe('26');
    expect(result.parsed.sequence).toBe('123456');
  });

  it('rejects wrong length', () => {
    const result = validateStudentNumber('12345');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid length');
  });

  it('rejects non-digit characters', () => {
    const result = validateStudentNumber('26a1000001');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('digits only');
  });

  it('rejects invalid role code', () => {
    const base = '260123456';
    const invalid = `${base}${computeCheckDigit(base)}`;
    const result = validateStudentNumber(invalid);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid role code');
  });

  it('rejects invalid check digit', () => {
    const number = buildValidNumber();
    const tampered = number.slice(0, -1) + ((Number(number.slice(-1)) + 1) % 10);
    const result = validateStudentNumber(tampered);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid check digit');
  });
});
