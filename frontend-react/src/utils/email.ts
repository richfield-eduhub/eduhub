// Email simulation utility
// In production, replace sendEmail() with a real API call e.g. EmailJS, SendGrid, or your backend

export interface EmailPayload {
  to: string;
  toName: string;
  subject: string;
  html: string;
}

// Simulates sending — logs to console and stores in localStorage for demo preview
export const sendEmail = (payload: EmailPayload): void => {
  console.log('📧 EMAIL SENT', payload);
  const sent = JSON.parse(localStorage.getItem('sentEmails') || '[]');
  sent.unshift({ ...payload, sentAt: new Date().toISOString() });
  localStorage.setItem('sentEmails', JSON.stringify(sent.slice(0, 20)));
};

export const buildApplicationConfirmationEmail = (data: {
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  applicationId: string;
  qualificationName: string;
  qualificationCode: string;
  submittedAt: string;
  nationality: string;
  idOrPassport: string;
}): EmailPayload => {
  const date = new Date(data.submittedAt).toLocaleDateString('en-ZA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { margin: 0; padding: 0; background: #F4F6FB; font-family: 'DM Sans', Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 32px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,26,77,0.10); }
    .header { background: linear-gradient(135deg, #001A4D 0%, #003DA5 100%); padding: 36px 40px; color: white; }
    .header-logo { font-size: 28px; font-weight: 900; letter-spacing: 3px; margin-bottom: 6px; }
    .header-sub { font-size: 13px; opacity: 0.65; letter-spacing: 1px; }
    .banner { background: #059669; color: white; text-align: center; padding: 16px 24px; font-weight: 700; font-size: 15px; }
    .body { padding: 36px 40px; }
    .greeting { font-size: 22px; font-weight: 700; color: #001A4D; margin-bottom: 12px; }
    .para { font-size: 15px; color: #374151; line-height: 1.7; margin-bottom: 16px; }
    .ref-box { background: linear-gradient(135deg, #001A4D, #003DA5); border-radius: 12px; padding: 24px 28px; color: white; text-align: center; margin: 24px 0; }
    .ref-label { font-size: 12px; opacity: 0.7; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
    .ref-number { font-family: 'Courier New', monospace; font-size: 24px; font-weight: 700; background: rgba(255,255,255,0.15); padding: 10px 24px; border-radius: 8px; display: inline-block; letter-spacing: 2px; }
    .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
    .details-table tr:nth-child(odd) td { background: #F4F6FB; }
    .details-table td { padding: 10px 14px; border-bottom: 1px solid #E5E7EB; }
    .details-table td:first-child { font-weight: 600; color: #6B7280; width: 45%; }
    .details-table td:last-child { color: #001A4D; font-weight: 500; }
    .steps { margin: 24px 0; }
    .step-item { display: flex; gap: 14px; margin-bottom: 16px; align-items: flex-start; }
    .step-num { width: 28px; height: 28px; background: #003DA5; border-radius: 50%; color: white; font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .step-text { font-size: 14px; color: #374151; line-height: 1.6; padding-top: 4px; }
    .alert-box { background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 10px; padding: 16px 20px; font-size: 14px; color: #3730A3; margin: 20px 0; }
    .footer { background: #001A4D; padding: 28px 40px; color: rgba(255,255,255,0.55); font-size: 12px; text-align: center; }
    .footer-logo { color: white; font-weight: 700; font-size: 16px; letter-spacing: 2px; margin-bottom: 6px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-logo">EDUHUB</div>
      <div class="header-sub">GRADUATE INSTITUTE OF TECHNOLOGY</div>
    </div>
    <div class="banner">✅ Application Successfully Received</div>
    <div class="body">
      <div class="greeting">Dear ${data.firstName} ${data.lastName},</div>
      <p class="para">
        Thank you for submitting your application to <strong>EduHub</strong>.
        We are pleased to confirm that your application has been received and is currently under review by our admissions team.
      </p>

      <div class="ref-box">
        <div class="ref-label">Your Student Reference Number</div>
        <div class="ref-number">${data.studentId}</div>
        <div style="font-size: 12px; opacity: 0.65; margin-top: 10px;">Please quote this number in all future correspondence</div>
      </div>

      <p class="para"><strong>Here is a summary of what we received:</strong></p>
      <table class="details-table">
        <tr><td>Full Name</td><td>${data.firstName} ${data.lastName}</td></tr>
        <tr><td>Application ID</td><td>${data.applicationId}</td></tr>
        <tr><td>${data.nationality === 'South African' ? 'SA ID Number' : 'Passport Number'}</td><td>${data.idOrPassport}</td></tr>
        <tr><td>Nationality</td><td>${data.nationality}</td></tr>
        <tr><td>Qualification Applied For</td><td>${data.qualificationName} (${data.qualificationCode})</td></tr>
        <tr><td>Date Submitted</td><td>${date}</td></tr>
      </table>

      <p class="para"><strong>What happens next?</strong></p>
      <div class="steps">
        <div class="step-item">
          <div class="step-num">1</div>
          <div class="step-text"><strong>Application Review</strong> — Our admissions team will review your application and supporting documents within <strong>3–5 business days</strong>.</div>
        </div>
        <div class="step-item">
          <div class="step-num">2</div>
          <div class="step-text"><strong>Outcome Notification</strong> — You will receive an email at <strong>${data.email}</strong> with the outcome of your application.</div>
        </div>
        <div class="step-item">
          <div class="step-num">3</div>
          <div class="step-text"><strong>Approved?</strong> — If approved, you will receive your Student ID and a temporary login password to access the student portal and register for modules.</div>
        </div>
      </div>

      <div class="alert-box">
        📎 <strong>Documents Reminder:</strong> If you have not yet submitted your supporting documents (certified ID/Passport copy, Matric certificate, etc.), please email them to <strong>admissions@eduhub.ac.za</strong> quoting your reference number <strong>${data.studentId}</strong>. Your application will only be fully processed once all documents are received.
      </div>

      <p class="para">
        If you have any questions or need to update your application, please do not hesitate to contact our admissions office at
        <strong>admissions@eduhub.ac.za</strong> or call <strong>0860 EDUHUB (0860 742 434)</strong>.
      </p>
      <p class="para" style="color: #6B7280; font-size: 14px;">
        We look forward to welcoming you to the EduHub family. 🎓
      </p>
    </div>
    <div class="footer">
      <div class="footer-logo">EDUHUB</div>
      <div>Graduate Institute of Technology</div>
      <div style="margin-top: 6px;">Johannesburg · Cape Town · Durban · Pretoria</div>
      <div style="margin-top: 10px; font-size: 11px; opacity: 0.5;">This is an automated message. Please do not reply directly to this email.</div>
    </div>
  </div>
</body>
</html>
  `.trim();

  return {
    to: data.email,
    toName: `${data.firstName} ${data.lastName}`,
    subject: `Application Received – Reference ${data.studentId} | EduHub`,
    html,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  REAL EMAIL — Application Approved (New First-Year Students)
//  Uses EmailJS browser SDK.  Configure credentials in emailConfig.ts
// ─────────────────────────────────────────────────────────────────────────────
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG, EMAILJS_CONFIGURED } from './emailConfig';

export interface ApprovalEmailData {
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  applicationId: string;
  qualificationName: string;
  qualificationCode: string;
  tempPassword: string;
  docsUploaded: string[];       // the docs they ticked in the application
  nationality: string;
  admittedFor: string;          // e.g. '1st Year / 1st Semester'
  submittedAt: string;
}

/** Actually sends the approval email via EmailJS.
 *  Falls back to console.log if EMAILJS_CONFIGURED = false. */
export const sendApprovalEmail = async (data: ApprovalEmailData): Promise<{ success: boolean; message: string }> => {
  const html = buildApprovalEmailHtml(data);

  // ── Store locally for preview regardless ──
  const sent = JSON.parse(localStorage.getItem('sentEmails') || '[]');
  sent.unshift({ to: data.email, toName: `${data.firstName} ${data.lastName}`, subject: `Application Approved — Welcome to EduHub | ${data.studentId}`, html, sentAt: new Date().toISOString(), type: 'approval' });
  localStorage.setItem('sentEmails', JSON.stringify(sent.slice(0, 30)));

  if (!EMAILJS_CONFIGURED) {
    console.log(`📧 [DEV MODE] Approval email would be sent to ${data.email}`, data);
    return { success: true, message: 'dev_mode' };
  }

  try {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      {
        to_email:  data.email,
        to_name:   `${data.firstName} ${data.lastName}`,
        subject:   `🎉 Application Approved — Welcome to EduHub | ${data.studentId}`,
        html_body: html,
      },
    );
    return { success: true, message: 'sent' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('EmailJS error:', msg);
    return { success: false, message: msg };
  }
};

export const buildApprovalEmailHtml = (data: ApprovalEmailData): string => {
  const date = new Date(data.submittedAt).toLocaleDateString('en-ZA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const isForeign = data.nationality !== 'South African';
  const docsToSubmit = data.docsUploaded.length > 0 ? data.docsUploaded : [
    isForeign ? 'Certified copy of Passport (all pages)' : 'Certified copy of SA ID document',
    isForeign ? 'Study permit / visa' : 'Certified copy of Matric certificate',
    'Proof of payment / funding letter',
    'Passport photo',
  ];

  const docItems = docsToSubmit.map(d => `
    <tr>
      <td style="padding: 10px 14px; border-bottom: 1px solid #E5E7EB; font-size: 14px; color: #374151;">
        <span style="display:inline-block; width:20px; height:20px; background:#059669; border-radius:4px; color:white; font-weight:700; font-size:12px; text-align:center; line-height:20px; margin-right:10px; vertical-align:middle;">✓</span>
        ${d}
      </td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Application Approved — EduHub</title>
</head>
<body style="margin:0;padding:0;background:#F4F6FB;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:620px;margin:32px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,26,77,0.12);">

    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#001A4D 0%,#003DA5 100%);padding:36px 40px;color:white;">
      <div style="font-size:26px;font-weight:900;letter-spacing:3px;margin-bottom:4px;">EDUHUB</div>
      <div style="font-size:12px;opacity:0.6;letter-spacing:1px;">GRADUATE INSTITUTE OF TECHNOLOGY</div>
    </div>

    <!-- SUCCESS BANNER -->
    <div style="background:#059669;color:white;text-align:center;padding:18px 24px;">
      <div style="font-size:28px;margin-bottom:6px;">🎉</div>
      <div style="font-weight:800;font-size:18px;letter-spacing:0.5px;">CONGRATULATIONS! YOUR APPLICATION IS APPROVED</div>
    </div>

    <!-- BODY -->
    <div style="padding:36px 40px;">
      <p style="font-size:22px;font-weight:700;color:#001A4D;margin:0 0 14px;">Dear ${data.firstName} ${data.lastName},</p>

      <p style="font-size:15px;color:#374151;line-height:1.75;margin:0 0 18px;">
        We are <strong>thrilled to inform you</strong> that your application to
        <strong>EduHub</strong> has been
        <strong style="color:#059669;">reviewed and successfully approved</strong> by our admissions team.
        Welcome to the EduHub family! 🎓
      </p>

      <!-- STUDENT ID BOX -->
      <div style="background:linear-gradient(135deg,#001A4D,#1a4da8);border-radius:14px;padding:26px 30px;color:white;text-align:center;margin:24px 0;">
        <div style="font-size:12px;opacity:0.65;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px;">Your Student ID Number</div>
        <div style="font-family:'Courier New',monospace;font-size:26px;font-weight:700;background:rgba(255,255,255,0.15);padding:10px 28px;border-radius:8px;display:inline-block;letter-spacing:2px;">${data.studentId}</div>
        <div style="font-size:12px;opacity:0.5;margin-top:10px;">Please quote this in all future correspondence</div>
      </div>

      <!-- ENROLMENT DETAILS -->
      <p style="font-size:14px;font-weight:700;color:#001A4D;margin:20px 0 10px;">📋 Enrolment Details</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;border-radius:8px;overflow:hidden;border:1px solid #E5E7EB;">
        <tr style="background:#F4F6FB;"><td style="padding:10px 14px;font-weight:600;color:#6B7280;width:45%;border-bottom:1px solid #E5E7EB;">Full Name</td><td style="padding:10px 14px;color:#001A4D;font-weight:500;border-bottom:1px solid #E5E7EB;">${data.firstName} ${data.lastName}</td></tr>
        <tr><td style="padding:10px 14px;font-weight:600;color:#6B7280;border-bottom:1px solid #E5E7EB;">Application Reference</td><td style="padding:10px 14px;color:#001A4D;font-family:monospace;border-bottom:1px solid #E5E7EB;">${data.applicationId}</td></tr>
        <tr style="background:#F4F6FB;"><td style="padding:10px 14px;font-weight:600;color:#6B7280;border-bottom:1px solid #E5E7EB;">Qualification</td><td style="padding:10px 14px;color:#001A4D;border-bottom:1px solid #E5E7EB;"><strong>${data.qualificationName}</strong> (${data.qualificationCode})</td></tr>
        <tr><td style="padding:10px 14px;font-weight:600;color:#6B7280;border-bottom:1px solid #E5E7EB;">Admitted For</td><td style="padding:10px 14px;color:#001A4D;border-bottom:1px solid #E5E7EB;">${data.admittedFor}</td></tr>
        <tr style="background:#F4F6FB;"><td style="padding:10px 14px;font-weight:600;color:#6B7280;">Application Submitted</td><td style="padding:10px 14px;color:#001A4D;">${date}</td></tr>
      </table>

      <!-- LOGIN CREDENTIALS -->
      <div style="background:#EEF2FF;border:1px solid #C7D2FE;border-radius:12px;padding:20px 24px;margin:24px 0;">
        <p style="font-weight:700;color:#001A4D;font-size:15px;margin:0 0 12px;">🔑 Your Portal Login Credentials</p>
        <p style="font-size:14px;color:#374151;margin:0 0 14px;line-height:1.6;">You can now log in to the <strong>EduHub Student Portal</strong> to access your dashboard, register for modules, and track your progress.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;font-weight:600;color:#6B7280;width:140px;">Login Email</td><td style="padding:8px 0;color:#001A4D;font-family:monospace;font-weight:700;">${data.email}</td></tr>
          <tr><td style="padding:8px 0;font-weight:600;color:#6B7280;">Temporary Password</td><td style="padding:8px 0;"><span style="background:#001A4D;color:white;font-family:monospace;font-weight:700;font-size:15px;padding:4px 14px;border-radius:6px;letter-spacing:1px;">${data.tempPassword}</span></td></tr>
        </table>
        <div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:8px;padding:10px 14px;margin-top:14px;font-size:13px;color:#92400e;">
          ⚠️ <strong>Important:</strong> This is a temporary password. You will be prompted to set your own password on your first login. Please do not share this password with anyone.
        </div>
      </div>

      <!-- DOCUMENTS SECTION -->
      <div style="border:2px solid #FEF3C7;border-radius:12px;overflow:hidden;margin:24px 0;">
        <div style="background:#FEF3C7;padding:14px 20px;">
          <p style="font-weight:800;color:#92400e;font-size:15px;margin:0;">📎 ACTION REQUIRED — Submit Your Documents</p>
        </div>
        <div style="padding:16px 20px;">
          <p style="font-size:14px;color:#374151;line-height:1.7;margin:0 0 14px;">
            To <strong>complete your enrolment</strong>, you must submit the following documents that you indicated during your application.
            Please email certified copies to <strong style="color:#001A4D;">admissions@eduhub.ac.za</strong> with your Student ID
            <strong style="color:#001A4D;">${data.studentId}</strong> in the subject line, or deliver them in person at any EduHub campus.
          </p>
          <p style="font-size:13px;font-weight:700;color:#001A4D;margin:0 0 10px;">Documents to submit:</p>
          <table style="width:100%;border-collapse:collapse;border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
            ${docItems}
          </table>
          <p style="font-size:13px;color:#6B7280;margin:14px 0 0;line-height:1.6;">
            📅 <strong>Deadline:</strong> All documents must be received within <strong>14 calendar days</strong> of this email.
            Failure to submit may result in your enrolment being placed on hold.
          </p>
        </div>
      </div>

      <!-- NEXT STEPS -->
      <p style="font-size:14px;font-weight:700;color:#001A4D;margin:20px 0 14px;">🚀 Your Next Steps</p>
      <table style="width:100%;border-collapse:collapse;">
        ${[
          ['1', '#003DA5', 'Submit Documents', `Email certified copies of the documents listed above to admissions@eduhub.ac.za within 14 days.`],
          ['2', '#059669', 'Log In to the Portal', `Visit the student portal and log in using your credentials above. Set your new permanent password.`],
          ['3', '#7C3AED', 'Register for Modules', `Once logged in, navigate to "Register Modules" to select and submit your module registration for the semester.`],
          ['4', '#DB2777', 'Attend Orientation', `Check your portal for orientation dates, timetables, and your campus contact information.`],
        ].map(([n, c, title, desc]) => `
        <tr>
          <td style="vertical-align:top;width:36px;padding-bottom:16px;">
            <div style="width:32px;height:32px;background:${c};border-radius:50%;color:white;font-weight:700;font-size:14px;text-align:center;line-height:32px;">${n}</div>
          </td>
          <td style="padding:0 0 16px 12px;font-size:14px;color:#374151;line-height:1.65;">
            <strong style="color:#001A4D;">${title}</strong><br/>${desc}
          </td>
        </tr>`).join('')}
      </table>

      <!-- CONTACT -->
      <div style="background:#F4F6FB;border-radius:10px;padding:18px 20px;margin-top:8px;font-size:14px;color:#374151;line-height:1.7;">
        <strong style="color:#001A4D;">Need help?</strong> Our admissions team is here for you:<br/>
        📧 <a href="mailto:admissions@eduhub.ac.za" style="color:#003DA5;font-weight:600;">admissions@eduhub.ac.za</a> &nbsp;·&nbsp;
        📞 <strong>0860 742 434</strong> (0860 EDUHUB)<br/>
        🌐 <a href="https://www.eduhub.ac.za" style="color:#003DA5;">www.eduhub.ac.za</a>
      </div>

      <p style="font-size:15px;color:#374151;margin:24px 0 0;line-height:1.7;">
        Once again, <strong>congratulations</strong> on this exciting new chapter. We can't wait to see you thrive at EduHub! 🌟
      </p>
      <p style="font-size:14px;color:#6B7280;margin:10px 0 0;">
        Warm regards,<br/>
        <strong style="color:#001A4D;">The Admissions Team</strong><br/>
        EduHub
      </p>
    </div>

    <!-- FOOTER -->
    <div style="background:#001A4D;padding:26px 40px;color:rgba(255,255,255,0.5);font-size:12px;text-align:center;">
      <div style="color:white;font-weight:700;font-size:15px;letter-spacing:2px;margin-bottom:5px;">EDUHUB</div>
      <div>Graduate Institute of Technology</div>
      <div style="margin-top:4px;">Johannesburg · Cape Town · Durban · Pretoria · Port Elizabeth</div>
      <div style="margin-top:10px;font-size:11px;opacity:0.45;">This is an automated message sent to ${data.email}. Please do not reply directly to this email.</div>
    </div>

  </div>
</body>
</html>`;
};
