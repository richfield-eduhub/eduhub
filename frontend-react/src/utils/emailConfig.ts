/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║              EMAILJS CONFIGURATION — EDUHUB               ║
 * ╠══════════════════════════════════════════════════════════════╣
 * ║  HOW TO SET UP (one-time, free at emailjs.com):              ║
 * ║                                                              ║
 * ║  1. Go to https://www.emailjs.com and sign up for free       ║
 * ║                                                              ║
 * ║  2. Add Email Service:                                       ║
 * ║     Dashboard → Email Services → Add New Service             ║
 * ║     Choose Gmail (or Outlook etc.), connect your             ║
 * ║     admissions@eduhub.ac.za account                       ║
 * ║     Copy the Service ID (looks like "service_abc123")        ║
 * ║                                                              ║
 * ║  3. Create Email Template:                                   ║
 * ║     Dashboard → Email Templates → Create New Template        ║
 * ║     Set "To Email" field to: {{to_email}}                    ║
 * ║     Set "Subject" to: {{subject}}                            ║
 * ║     In the HTML body, paste just: {{{html_body}}}            ║
 * ║     (triple braces — EmailJS uses this for raw HTML)         ║
 * ║     Copy the Template ID (looks like "template_xyz789")      ║
 * ║                                                              ║
 * ║  4. Get your Public Key:                                     ║
 * ║     Dashboard → Account → General → Public Key               ║
 * ║     Copy the key (looks like "user_XXXXXXXXXXXXXXX")         ║
 * ║                                                              ║
 * ║  5. Paste all three values below — save and redeploy         ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

export const EMAILJS_CONFIG = {
  SERVICE_ID:  'YOUR_SERVICE_ID',   // e.g. 'service_abc123'
  TEMPLATE_ID: 'YOUR_TEMPLATE_ID',  // e.g. 'template_xyz789'
  PUBLIC_KEY:  'YOUR_PUBLIC_KEY',   // e.g. 'user_XXXXXXXXXXXXXXX'
};

/** Set to false once you've filled in the real credentials above */
export const EMAILJS_CONFIGURED = false;
