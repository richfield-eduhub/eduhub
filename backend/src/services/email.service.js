const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.fromAddress = process.env.EMAIL_FROM || 'admissions@eduhub.ac.za';
    this.admissionsEmail = process.env.ADMISSIONS_EMAIL || 'admissions@eduhub.ac.za';
    this.transporter = this._createTransporter();
  }

  _createTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      return null;
    }

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  _getRequiredDocuments(nationality) {
    if (String(nationality || '').trim() === 'South African') {
      return [
        'Certified copy of SA ID document',
        'Certified copy of Matric certificate',
        'Certified copy of tertiary qualifications',
        'Proof of payment / funding letter',
        'Passport photo',
      ];
    }
    return [
      'Certified copy of Passport (all pages)',
      'Study permit / visa',
      'Certified copy of highest qualification',
      'Proof of payment / funding letter',
      'Passport photo',
      'SAQA evaluation letter',
    ];
  }

  async sendAdmissionsOutcomeEmail(payload = {}) {
    const {
      to,
      fullName,
      studentNumber,
      qualificationName,
      admittedFor,
      submittedAt,
      loginEmail,
      temporaryPassword,
      decision,
      suggestionQualification,
      rejectionReason,
      nationality,
    } = payload;

    if (!to) return { sent: false, reason: 'Missing recipient email' };
    if (!this.transporter) {
      console.warn('[EmailService] SMTP not configured. Skipping email send.');
      return { sent: false, reason: 'SMTP not configured' };
    }

    const normalizedDecision = String(decision || 'conditionally_accepted');
    const subjectMap = {
      conditionally_accepted: 'EduHub Application Update - Conditional Acceptance',
      rejected: 'EduHub Application Update - Not Successful',
      suggested_alternative: 'EduHub Application Update - Alternative Qualification Suggestion',
      approved: 'EduHub Application Approved',
    };
    const headingMap = {
      conditionally_accepted: 'CONGRATULATIONS! YOUR APPLICATION IS CONDITIONALLY ACCEPTED',
      rejected: 'APPLICATION OUTCOME: NOT APPROVED',
      suggested_alternative: 'APPLICATION UPDATE: ALTERNATIVE QUALIFICATION SUGGESTED',
      approved: 'CONGRATULATIONS! YOUR APPLICATION IS APPROVED',
    };
    const introMap = {
      conditionally_accepted:
        'We are pleased to inform you that your application has been conditionally accepted, pending document verification.',
      rejected:
        'Thank you for your application. After review, we are unable to offer admission for your selected qualification at this time.',
      suggested_alternative:
        'Your selected qualification is currently not recommended based on the admission assessment, but we have suggested a suitable alternative below.',
      approved: 'We are thrilled to inform you that your application to EduHub has been approved.',
    };

    const requiredDocuments = this._getRequiredDocuments(nationality);
    const docsListHtml = requiredDocuments.map((doc) => `<li>${doc}</li>`).join('');
    const submittedDateLabel = submittedAt
      ? new Date(submittedAt).toLocaleDateString('en-ZA', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : 'N/A';

    const suggestionBlock = suggestionQualification
      ? `<p><strong>Suggested Qualification:</strong> ${suggestionQualification}</p>`
      : '';
    const rejectionBlock = rejectionReason
      ? `<p><strong>Reason:</strong> ${rejectionReason}</p>`
      : '';

    const html = `
      <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.6;max-width:700px;margin:0 auto">
        <h2 style="color:#001A4D;margin-bottom:4px">EDUHUB</h2>
        <div style="letter-spacing:1px;font-size:13px;color:#475569;margin-bottom:18px">STUDENT PORTAL</div>
        <h3 style="color:#123f7a">${headingMap[normalizedDecision] || headingMap.conditionally_accepted}</h3>
        <p>Dear ${fullName || 'Applicant'},</p>
        <p>${introMap[normalizedDecision] || introMap.conditionally_accepted}</p>
        ${rejectionBlock}
        ${suggestionBlock}
        <h4 style="margin:18px 0 8px">Your Student Number</h4>
        <p style="font-family:monospace;font-size:18px;background:#f1f5f9;padding:8px 12px;display:inline-block;border-radius:6px">${studentNumber || 'Pending'}</p>
        <table style="width:100%;border-collapse:collapse;margin-top:14px">
          <tr><td style="padding:6px 0"><strong>Full Name</strong></td><td style="padding:6px 0">${fullName || '-'}</td></tr>
          <tr><td style="padding:6px 0"><strong>Qualification</strong></td><td style="padding:6px 0">${qualificationName || '-'}</td></tr>
          <tr><td style="padding:6px 0"><strong>Admitted For</strong></td><td style="padding:6px 0">${admittedFor || '-'}</td></tr>
          <tr><td style="padding:6px 0"><strong>Date Submitted</strong></td><td style="padding:6px 0">${submittedDateLabel}</td></tr>
        </table>
        <h4 style="margin:18px 0 8px">Portal Login Credentials</h4>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0"><strong>Login Email</strong></td><td style="padding:6px 0">${loginEmail || to}</td></tr>
          <tr><td style="padding:6px 0"><strong>Temporary Password</strong></td><td style="padding:6px 0">${temporaryPassword || '-'}</td></tr>
        </table>
        <p><strong>Important:</strong> This is a temporary password. You will be prompted to change it on first login.</p>
        <h4 style="margin:18px 0 8px">Action Required — Submit Documents Within 3–5 Business Days</h4>
        <p>Email certified copies to <strong>${this.admissionsEmail}</strong> with Student Number <strong>${studentNumber || 'Pending'}</strong> in the subject line.</p>
        <ul>${docsListHtml}</ul>
        <p>Warm regards,<br/>The Admissions Team<br/>EduHub</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.fromAddress,
      to,
      subject: subjectMap[normalizedDecision] || subjectMap.conditionally_accepted,
      html,
    });

    return { sent: true };
  }

  /**
   * Send email verification email
   */
  async sendVerificationEmail({ to, fullName, verificationToken }) {
    if (!to || !verificationToken) {
      return { sent: false, reason: 'Missing required fields' };
    }

    if (!this.transporter) {
      console.warn('[EmailService] SMTP not configured. Skipping email send.');
      return { sent: false, reason: 'SMTP not configured' };
    }

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost'}/verify-email?token=${verificationToken}`;
    const expiryHours = 24;

    const html = `
      <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.6;max-width:700px;margin:0 auto">
        <h2 style="color:#001A4D;margin-bottom:4px">EDUHUB</h2>
        <div style="letter-spacing:1px;font-size:13px;color:#475569;margin-bottom:18px">STUDENT PORTAL</div>
        <h3 style="color:#123f7a">Verify Your Email Address</h3>
        <p>Dear ${fullName || 'User'},</p>
        <p>Thank you for registering with EduHub. To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
        <div style="margin:24px 0">
          <a href="${verificationUrl}" style="background:#001A4D;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="font-size:12px;word-break:break-all;background:#f1f5f9;padding:8px;border-radius:4px">${verificationUrl}</p>
        <p><strong>Important:</strong> This link will expire in ${expiryHours} hours.</p>
        <p>If you did not create an account with EduHub, please ignore this email.</p>
        <p>Warm regards,<br/>The EduHub Team</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.fromAddress,
      to,
      subject: 'EduHub - Verify Your Email Address',
      html,
    });

    return { sent: true };
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail({ to, fullName, resetToken }) {
    if (!to || !resetToken) {
      return { sent: false, reason: 'Missing required fields' };
    }

    if (!this.transporter) {
      console.warn('[EmailService] SMTP not configured. Skipping email send.');
      return { sent: false, reason: 'SMTP not configured' };
    }

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost'}/reset-password?token=${resetToken}`;
    const expiryHours = 1;

    const html = `
      <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.6;max-width:700px;margin:0 auto">
        <h2 style="color:#001A4D;margin-bottom:4px">EDUHUB</h2>
        <div style="letter-spacing:1px;font-size:13px;color:#475569;margin-bottom:18px">STUDENT PORTAL</div>
        <h3 style="color:#123f7a">Password Reset Request</h3>
        <p>Dear ${fullName || 'User'},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="margin:24px 0">
          <a href="${resetUrl}" style="background:#001A4D;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="font-size:12px;word-break:break-all;background:#f1f5f9;padding:8px;border-radius:4px">${resetUrl}</p>
        <p><strong>Important:</strong> This link will expire in ${expiryHours} hour.</p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        <p>Warm regards,<br/>The EduHub Team</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.fromAddress,
      to,
      subject: 'EduHub - Password Reset Request',
      html,
    });

    return { sent: true };
  }

  /**
   * Send application approval email
   */
  async sendApplicationApprovedEmail({
    to,
    fullName,
    referenceNumber,
    studentNumber,
    qualificationName,
    campusName,
    reviewedAt,
  }) {
    if (!to) {
      return { sent: false, reason: 'Missing recipient email' };
    }

    if (!this.transporter) {
      console.warn('[EmailService] SMTP not configured. Skipping email send.');
      return { sent: false, reason: 'SMTP not configured' };
    }

    const reviewedDateLabel = reviewedAt
      ? new Date(reviewedAt).toLocaleDateString('en-ZA', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : 'N/A';

    const portalUrl = `${process.env.FRONTEND_URL || 'http://localhost'}/student`;

    const html = `
      <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.6;max-width:700px;margin:0 auto">
        <h2 style="color:#001A4D;margin-bottom:4px">EDUHUB</h2>
        <div style="letter-spacing:1px;font-size:13px;color:#475569;margin-bottom:18px">STUDENT PORTAL</div>
        <h3 style="color:#10b981;margin-bottom:12px">✓ YOUR APPLICATION HAS BEEN APPROVED</h3>
        <p>Dear ${fullName || 'Applicant'},</p>
        <p>Congratulations! We are pleased to inform you that your application to EduHub has been <strong>officially approved</strong>.</p>

        <div style="background:#ecfdf5;border-left:4px solid #10b981;padding:16px;margin:20px 0;border-radius:4px">
          <h4 style="margin:0 0 12px 0;color:#047857">Application Details</h4>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:6px 0"><strong>Reference Number</strong></td><td style="padding:6px 0">${referenceNumber || 'N/A'}</td></tr>
            <tr><td style="padding:6px 0"><strong>Student Number</strong></td><td style="padding:6px 0;font-family:monospace">${studentNumber || 'Pending'}</td></tr>
            <tr><td style="padding:6px 0"><strong>Qualification</strong></td><td style="padding:6px 0">${qualificationName || 'N/A'}</td></tr>
            <tr><td style="padding:6px 0"><strong>Campus</strong></td><td style="padding:6px 0">${campusName || 'N/A'}</td></tr>
            <tr><td style="padding:6px 0"><strong>Approval Date</strong></td><td style="padding:6px 0">${reviewedDateLabel}</td></tr>
          </table>
        </div>

        <h4 style="margin:24px 0 12px">Next Steps</h4>
        <ol style="line-height:1.8">
          <li><strong>Access Your Student Portal:</strong> Log in using your student email and password</li>
          <li><strong>Complete Registration:</strong> Register for modules according to the academic calendar</li>
          <li><strong>Attend Orientation:</strong> Check your portal for orientation dates and details</li>
          <li><strong>Financial Clearance:</strong> Ensure all fees are paid or funding is confirmed</li>
        </ol>

        <div style="margin:24px 0">
          <a href="${portalUrl}" style="background:#001A4D;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">
            Access Student Portal
          </a>
        </div>

        <p><strong>Questions?</strong> Contact the Admissions Office at <a href="mailto:${this.admissionsEmail}">${this.admissionsEmail}</a></p>

        <p>We look forward to welcoming you to EduHub!</p>
        <p>Warm regards,<br/>The Admissions Team<br/>EduHub</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.fromAddress,
      to,
      subject: 'EduHub Application Approved - Welcome to EduHub!',
      html,
    });

    return { sent: true };
  }

  /**
   * Send application rejection email
   */
  async sendApplicationRejectedEmail({
    to,
    fullName,
    referenceNumber,
    qualificationName,
    campusName,
    rejectionReason,
    reviewedAt,
  }) {
    if (!to) {
      return { sent: false, reason: 'Missing recipient email' };
    }

    if (!this.transporter) {
      console.warn('[EmailService] SMTP not configured. Skipping email send.');
      return { sent: false, reason: 'SMTP not configured' };
    }

    const reviewedDateLabel = reviewedAt
      ? new Date(reviewedAt).toLocaleDateString('en-ZA', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : 'N/A';

    const html = `
      <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.6;max-width:700px;margin:0 auto">
        <h2 style="color:#001A4D;margin-bottom:4px">EDUHUB</h2>
        <div style="letter-spacing:1px;font-size:13px;color:#475569;margin-bottom:18px">STUDENT PORTAL</div>
        <h3 style="color:#dc2626;margin-bottom:12px">APPLICATION OUTCOME UPDATE</h3>
        <p>Dear ${fullName || 'Applicant'},</p>
        <p>Thank you for your interest in EduHub and for taking the time to submit your application.</p>
        <p>After careful review, we regret to inform you that we are unable to offer you admission at this time.</p>

        <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:16px;margin:20px 0;border-radius:4px">
          <h4 style="margin:0 0 12px 0;color:#991b1b">Application Details</h4>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:6px 0"><strong>Reference Number</strong></td><td style="padding:6px 0">${referenceNumber || 'N/A'}</td></tr>
            <tr><td style="padding:6px 0"><strong>Qualification</strong></td><td style="padding:6px 0">${qualificationName || 'N/A'}</td></tr>
            <tr><td style="padding:6px 0"><strong>Campus</strong></td><td style="padding:6px 0">${campusName || 'N/A'}</td></tr>
            <tr><td style="padding:6px 0"><strong>Review Date</strong></td><td style="padding:6px 0">${reviewedDateLabel}</td></tr>
          </table>
          ${
            rejectionReason
              ? `<div style="margin-top:16px">
                  <strong>Reason:</strong>
                  <p style="margin:8px 0 0;color:#7f1d1d">${rejectionReason}</p>
                </div>`
              : ''
          }
        </div>

        <h4 style="margin:24px 0 12px">Moving Forward</h4>
        <ul style="line-height:1.8">
          <li><strong>Explore Other Programs:</strong> We offer various qualifications that may suit your academic background and career goals</li>
          <li><strong>Improve Your Qualifications:</strong> Consider enhancing your academic record and reapplying in the future</li>
          <li><strong>Contact Admissions:</strong> Our team can provide guidance on alternative pathways</li>
        </ul>

        <p><strong>Need More Information?</strong> Contact the Admissions Office at <a href="mailto:${this.admissionsEmail}">${this.admissionsEmail}</a> for further clarification or to discuss alternative options.</p>

        <p>We appreciate your interest in EduHub and wish you success in your educational journey.</p>
        <p>Warm regards,<br/>The Admissions Team<br/>EduHub</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.fromAddress,
      to,
      subject: 'EduHub Application Outcome Update',
      html,
    });

    return { sent: true };
  }
}

module.exports = new EmailService();
