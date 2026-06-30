const { createMockSequelize } = require('../helpers/mockSequelize');

const mockSequelize = createMockSequelize();
jest.mock('../../src/config/database', () => mockSequelize);

const {
  normalizeContactEmail,
  normalizePhone,
  findContactConflicts,
  assertContactAvailable,
} = require('../../src/utils/contactValidator');

describe('contactValidator', () => {
  beforeEach(() => mockSequelize.reset());

  it('normalizes email and phone for comparison', () => {
    expect(normalizeContactEmail('  Test@Example.COM ')).toBe('test@example.com');
    expect(normalizePhone('+27 82 123 4567')).toBe('821234567');
    expect(normalizePhone('0821234567')).toBe('821234567');
  });

  it('detects email conflicts from users', async () => {
    mockSequelize.query
      .mockResolvedValueOnce([{ user_id: 9, email: 'taken@test.com', source: 'user' }]);

    const conflicts = await findContactConflicts({
      email: 'taken@test.com',
      idNumber: '9001015800088',
    });

    expect(conflicts.email.source).toBe('user');
    expect(conflicts.phone).toBeNull();
  });

  it('allows the same applicant identity to reuse contact details', async () => {
    mockSequelize.query.mockResolvedValue([]);

    const conflicts = await findContactConflicts({
      email: 'mine@test.com',
      phone: '0821234567',
      idNumber: '9001015800088',
    });

    expect(conflicts.email).toBeNull();
    expect(conflicts.phone).toBeNull();
  });

  it('throws when phone is already registered to another user', async () => {
    mockSequelize.query.mockResolvedValueOnce([
      { user_id: 3, phone: '0829999999', source: 'user' },
    ]);

    await expect(
      assertContactAvailable({
        phone: '0829999999',
        idNumber: '9001015800088',
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      field: 'phone',
    });
  });
});
