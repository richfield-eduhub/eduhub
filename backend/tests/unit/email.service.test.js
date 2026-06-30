const emailService = require('../../src/services/email.service');

describe('EmailService', () => {
  it('returns South African document checklist', () => {
    const docs = emailService._getRequiredDocuments('South African');
    expect(docs).toContain('Certified copy of SA ID document');
    expect(docs).toContain('Certified copy of Matric certificate');
  });

  it('returns foreign national document checklist', () => {
    const docs = emailService._getRequiredDocuments('Zimbabwean');
    expect(docs).toContain('Certified copy of Passport (all pages)');
    expect(docs).toContain('SAQA evaluation letter');
  });

  it('skips send when SMTP is not configured', async () => {
    const originalTransporter = emailService.transporter;
    emailService.transporter = null;

    try {
      const result = await emailService.sendAdmissionsOutcomeEmail({
        to: 'applicant@test.com',
        fullName: 'Test Applicant',
        decision: 'conditionally_accepted',
      });

      expect(result.sent).toBe(false);
      expect(result.reason).toBe('SMTP not configured');
    } finally {
      emailService.transporter = originalTransporter;
    }
  });

  it('skips send when recipient is missing', async () => {
    const result = await emailService.sendAdmissionsOutcomeEmail({
      fullName: 'No Email Applicant',
    });

    expect(result.sent).toBe(false);
    expect(result.reason).toBe('Missing recipient email');
  });
});
