/**
 * Application Constants
 * Based on database ENUM types and application logic
 */

const USER_ROLES = {
  ADMIN: 'admin',
  LECTURER: 'lecturer',
  STUDENT: 'student',
};

const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  BLOCKED: 'blocked',
  TERMINATED: 'terminated',
};

const LIFECYCLE_STATUS = {
  APPLICANT: 'applicant',
  ENROLLED: 'enrolled',
  ON_LEAVE: 'on_leave',
  ALUMNI: 'alumni',
  WITHDRAWN: 'withdrawn',
};

const ACADEMIC_STATUS = {
  ACTIVE: 'active',
  ON_LEAVE: 'on_leave',
  COMPLETED: 'completed',
  WITHDRAWN: 'withdrawn',
};

const REGISTRATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DROPPED: 'dropped',
};

const APPLICATION_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

const APPLICATION_TYPE = {
  NEW: 'new',
  RETURNING: 'returning',
  TRANSFER: 'transfer',
};

const DOCUMENT_TYPE = {
  ID_DOCUMENT: 'id_document',
  MATRIC_CERTIFICATE: 'matric_certificate',
  TERTIARY_TRANSCRIPT: 'tertiary_transcript',
  PROOF_OF_PAYMENT: 'proof_of_payment',
  PASSPORT_PHOTO: 'passport_photo',
  STUDY_PERMIT: 'study_permit',
  SAQA_EVALUATION: 'saqa_evaluation',
  OTHER: 'other',
};

const NOTIFICATION_TYPE = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

const JWT = {
  ACCESS_TOKEN_EXPIRY: process.env.JWT_EXPIRES_IN || '7d',
  REFRESH_TOKEN_EXPIRY: '30d',
};

module.exports = {
  USER_ROLES,
  ACCOUNT_STATUS,
  LIFECYCLE_STATUS,
  ACADEMIC_STATUS,
  REGISTRATION_STATUS,
  APPLICATION_STATUS,
  APPLICATION_TYPE,
  DOCUMENT_TYPE,
  NOTIFICATION_TYPE,
  PAGINATION,
  JWT,
};
