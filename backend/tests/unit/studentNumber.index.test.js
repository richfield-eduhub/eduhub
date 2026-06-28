const studentNumber = require('../../src/studentNumber');
const { computeCheckDigit } = require('../../src/studentNumber/luhn');

function buildValidNumber() {
  const base = '261000099';
  return `${base}${computeCheckDigit(base)}`;
}

describe('studentNumber module facade', () => {
  it('generates and formats a student number', async () => {
    const result = await studentNumber.generate({ year: 2026, role: 1 });
    expect(result.number).toMatch(/^\d{10}$/);
    expect(result.formatted).toContain('-');
  });

  it('validates student numbers', () => {
    const number = buildValidNumber();
    const result = studentNumber.validate(number);
    expect(result.valid).toBe(true);
  });

  it('returns role map', () => {
    const roles = studentNumber.getRoleMap();
    expect(roles[1]).toBe('Student');
    expect(roles[3]).toBe('Admin');
  });
});
