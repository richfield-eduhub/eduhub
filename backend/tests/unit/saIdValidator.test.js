const {
  isValidSouthAfricanIdNumber,
  deriveGenderFromSaId,
  genderMatchesSaId,
} = require('../../src/utils/saIdValidator');

describe('saIdValidator', () => {
  it('accepts a valid 13-digit SA ID', () => {
    expect(isValidSouthAfricanIdNumber('9001015800088')).toBe(true);
    expect(isValidSouthAfricanIdNumber('0209081234087')).toBe(true);
  });

  it('rejects IDs with an invalid check digit', () => {
    expect(isValidSouthAfricanIdNumber('9001015800085')).toBe(false);
    expect(isValidSouthAfricanIdNumber('8001015800085')).toBe(false);
  });

  it('rejects IDs that are not 13 digits', () => {
    expect(isValidSouthAfricanIdNumber('12345')).toBe(false);
    expect(isValidSouthAfricanIdNumber('')).toBe(false);
  });

  it('derives gender from SA ID digits 7–10', () => {
    expect(deriveGenderFromSaId('0501017546083')).toBe('Male');
    expect(deriveGenderFromSaId('9001010000088')).toBe('Female');
    expect(deriveGenderFromSaId('9001014999088')).toBe('Female');
    expect(deriveGenderFromSaId('9001015000088')).toBe('Male');
  });

  it('validates gender against SA ID', () => {
    expect(genderMatchesSaId('0501017546083', 'Male')).toBe(true);
    expect(genderMatchesSaId('0501017546083', 'Female')).toBe(false);
  });
});
