const {
  USER_ROLES,
  ACCOUNT_STATUS,
  APPLICATION_STATUS,
  REGISTRATION_STATUS,
  PAGINATION,
  JWT,
} = require('../../src/utils/constants');

describe('Application constants', () => {
  it('defines user roles', () => {
    expect(USER_ROLES.ADMIN).toBe('admin');
    expect(USER_ROLES.LECTURER).toBe('lecturer');
    expect(USER_ROLES.STUDENT).toBe('student');
  });

  it('defines account statuses', () => {
    expect(ACCOUNT_STATUS.ACTIVE).toBe('active');
    expect(ACCOUNT_STATUS.SUSPENDED).toBe('suspended');
  });

  it('defines application workflow statuses', () => {
    expect(APPLICATION_STATUS.DRAFT).toBe('draft');
    expect(APPLICATION_STATUS.PENDING).toBe('pending');
    expect(APPLICATION_STATUS.APPROVED).toBe('approved');
    expect(APPLICATION_STATUS.REJECTED).toBe('rejected');
  });

  it('defines registration statuses', () => {
    expect(REGISTRATION_STATUS.PENDING).toBe('pending');
    expect(REGISTRATION_STATUS.APPROVED).toBe('approved');
    expect(REGISTRATION_STATUS.DROPPED).toBe('dropped');
  });

  it('defines pagination defaults', () => {
    expect(PAGINATION.DEFAULT_PAGE).toBe(1);
    expect(PAGINATION.DEFAULT_LIMIT).toBe(20);
    expect(PAGINATION.MAX_LIMIT).toBe(100);
  });

  it('defines JWT expiry from environment', () => {
    expect(JWT.ACCESS_TOKEN_EXPIRY).toBe('7d');
    expect(JWT.REFRESH_TOKEN_EXPIRY).toBe('30d');
  });
});
