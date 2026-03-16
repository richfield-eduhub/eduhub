import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { QUALIFICATIONS, NATIONALITIES } from '../utils/data';
import { sendEmail, buildApplicationConfirmationEmail } from '../utils/email';
import type { Application } from '../types';

type AppType = 'new' | 'returning' | 'other' | null;
type AdmissionFor = '1st Semester' | '2nd Semester' | '1st Year' | '2nd Year' | '3rd Year' | '';

const NEW_STEPS = ['Personal', 'Contact & Address', 'Education', 'Qualification', 'Documents', 'Review & Submit'];
const RETURNING_STEPS = ['Verify Identity', 'Confirm Details', 'New Modules', 'Review & Submit'];

interface FormData {
  firstName: string; lastName: string; idNumber: string; passportNumber: string;
  dateOfBirth: string; gender: string; nationality: string;
  phone: string; email: string; altEmail: string;
  streetAddress: string; suburb: string; city: string; province: string; postalCode: string;
  highSchool: string; highSchoolYear: string; highestGrade: string;
  tertiaryInstitution: string; tertiaryQualification: string; tertiaryYear: string;
  payerName: string; payerRelation: string; payerPhone: string; payerEmail: string; payerAddress: string;
  qualificationCode: string; qualificationName: string;
  docsUploaded: string[];
  tcAccepted: boolean;
}

const empty: FormData = {
  firstName: '', lastName: '', idNumber: '', passportNumber: '',
  dateOfBirth: '', gender: '', nationality: 'South African',
  phone: '', email: '', altEmail: '',
  streetAddress: '', suburb: '', city: '', province: '', postalCode: '',
  highSchool: '', highSchoolYear: '', highestGrade: '',
  tertiaryInstitution: '', tertiaryQualification: '', tertiaryYear: '',
  payerName: '', payerRelation: '', payerPhone: '', payerEmail: '', payerAddress: '',
  qualificationCode: '', qualificationName: '',
  docsUploaded: [], tcAccepted: false,
};

export default function ApplicationPage() {
  const { submitApplication, findStudentByIdOrPassport } = useApp();
  const navigate = useNavigate();

  // --- Stage 0: choose type ---
  const [appType, setAppType] = useState<AppType>(null);
  const [admissionFor, setAdmissionFor] = useState<AdmissionFor>('');
  const [studyYear, setStudyYear] = useState<1 | 2 | 3>(1);
  const [typeConfirmed, setTypeConfirmed] = useState(false);

  // --- Returning student lookup ---
  const [lookupValue, setLookupValue] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [foundStudent, setFoundStudent] = useState<{ user: { name: string; email: string; studentId?: string }; application: Application } | null>(null);

  // --- Form ---
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<{ studentId: string; id: string } | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [emailPreview, setEmailPreview] = useState(false);
  const [emailHtml, setEmailHtml] = useState('');

  const isForeign = form.nationality !== 'South African';
  const STEPS = appType === 'returning' ? RETURNING_STEPS : NEW_STEPS;

  const set = (k: keyof FormData, v: string | boolean | string[]) =>
    setForm(f => ({ ...f, [k]: v }));

  // ── Returning student: lookup ──
  const handleLookup = () => {
    setLookupError('');
    if (!lookupValue.trim()) { setLookupError('Please enter your ID or passport number.'); return; }
    const result = findStudentByIdOrPassport(lookupValue.trim());
    if (!result) {
      setLookupError('No approved student record found for that ID/passport number. Please contact admissions.');
      return;
    }
    // Pre-fill form from existing application
    const a = result.application;
    setForm({
      firstName: a.firstName, lastName: a.lastName,
      idNumber: a.idNumber, passportNumber: a.passportNumber,
      dateOfBirth: a.dateOfBirth, gender: a.gender, nationality: a.nationality,
      phone: a.phone, email: a.email, altEmail: a.altEmail || '',
      streetAddress: a.streetAddress, suburb: a.suburb, city: a.city,
      province: a.province, postalCode: a.postalCode,
      highSchool: a.highSchool, highSchoolYear: a.highSchoolYear, highestGrade: a.highestGrade,
      tertiaryInstitution: a.tertiaryInstitution || '', tertiaryQualification: a.tertiaryQualification || '',
      tertiaryYear: a.tertiaryYear || '',
      payerName: a.payerName, payerRelation: a.payerRelation, payerPhone: a.payerPhone,
      payerEmail: a.payerEmail, payerAddress: a.payerAddress,
      qualificationCode: a.qualificationCode, qualificationName: a.qualificationName,
      docsUploaded: [], tcAccepted: false,
    });
    setFoundStudent(result);
    setStep(1);
  };

  // ── Validation ──
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (appType === 'new') {
      if (step === 0) {
        if (!form.firstName) e.firstName = 'Required';
        if (!form.lastName) e.lastName = 'Required';
        if (!form.nationality) e.nationality = 'Required';
        if (!isForeign) { if (!form.idNumber || form.idNumber.length < 13) e.idNumber = 'Enter a valid 13-digit SA ID'; }
        else { if (!form.passportNumber || form.passportNumber.length < 5) e.passportNumber = 'Enter a valid passport number'; }
        if (!form.dateOfBirth) e.dateOfBirth = 'Required';
        if (!form.gender) e.gender = 'Required';
      }
      if (step === 1) {
        if (!form.phone) e.phone = 'Required';
        if (!form.email || !form.email.includes('@')) e.email = 'Enter a valid email';
        if (!form.streetAddress) e.streetAddress = 'Required';
        if (!form.city) e.city = 'Required';
        if (!form.province) e.province = 'Required';
      }
      if (step === 2) {
        if (!form.highSchool) e.highSchool = 'Required';
        if (!form.highestGrade) e.highestGrade = 'Required';
      }
      if (step === 3) {
        if (!form.qualificationCode) e.qualificationCode = 'Please select a qualification';
        if (!form.payerName) e.payerName = 'Required';
        if (!form.payerPhone) e.payerPhone = 'Required';
      }
    }
    if (appType === 'returning') {
      if (step === 1) {
        if (!form.phone) e.phone = 'Required';
        if (!form.email || !form.email.includes('@')) e.email = 'Required';
      }
    }
    const lastStep = STEPS.length - 1;
    if (step === lastStep) {
      if (!form.tcAccepted) e.tcAccepted = 'You must accept the Terms and Conditions';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const handleQualChange = (code: string) => {
    const q = QUALIFICATIONS.find(q => q.code === code);
    set('qualificationCode', code);
    set('qualificationName', q?.name || '');
  };

  const admissionToYear = (af: AdmissionFor): 1 | 2 | 3 => {
    if (af === '2nd Year') return 2;
    if (af === '3rd Year') return 3;
    return 1;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const yr = appType === 'returning' ? admissionToYear(admissionFor) : studyYear;
    const app = submitApplication({
      ...form,
      applicationType: appType === 'returning' ? 'returning' : appType === 'other' ? 'other' : 'new',
      admissionFor: admissionFor || '1st Semester',
      studyYear: yr,
    });
    setSubmittedApp({ studentId: app.studentId, id: app.id });
    const emailPayload = buildApplicationConfirmationEmail({
      firstName: form.firstName, lastName: form.lastName,
      email: form.email, studentId: app.studentId, applicationId: app.id,
      qualificationName: form.qualificationName, qualificationCode: form.qualificationCode,
      submittedAt: app.submittedAt, nationality: form.nationality,
      idOrPassport: isForeign ? form.passportNumber : form.idNumber,
    });
    sendEmail(emailPayload);
    setEmailHtml(emailPayload.html);
    setEmailSent(true);
    setSubmitted(true);
  };

  const toggleDoc = (doc: string) => {
    const docs = form.docsUploaded.includes(doc) ? form.docsUploaded.filter(d => d !== doc) : [...form.docsUploaded, doc];
    set('docsUploaded', docs);
  };

  // Get new modules for returning student (their next year's modules)
  const returningYear = admissionToYear(admissionFor);
  const newModules = foundStudent
    ? QUALIFICATIONS.find(q => q.code === foundStudent.application.qualificationCode)?.modules.filter(m => m.year === returningYear) || []
    : [];

  // ── SUBMITTED CONFIRMATION ──
  if (submitted && submittedApp) {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f4f4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 620, width: '100%' }}>
          <div style={{ background: 'linear-gradient(135deg, #001A4D 0%, #123f7a 100%)', color: 'white', borderRadius: 16, padding: 32, textAlign: 'center', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ fontSize: 56, marginBottom: 12 }}>{appType === 'returning' ? '🔄' : '🎉'}</div>
            <h2 style={{ fontFamily: 'var(--font-display, Arial)', fontSize: 28, letterSpacing: 2, marginBottom: 8 }}>
              {appType === 'returning' ? 'RE-ENROLMENT SUBMITTED!' : 'APPLICATION SUBMITTED!'}
            </h2>
            <p style={{ opacity: 0.85, fontSize: 15, marginBottom: 16 }}>
              {appType === 'returning'
                ? 'Your returning student application has been received and is under review.'
                : 'Your application has been received and is being reviewed by our admissions team.'}
            </p>
            <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>YOUR STUDENT REFERENCE NUMBER</div>
            <div style={{ fontFamily: 'monospace', fontSize: 22, background: 'rgba(255,255,255,0.15)', padding: '8px 20px', borderRadius: 8, display: 'inline-block', letterSpacing: 1 }}>{submittedApp.studentId}</div>
          </div>

          {emailSent && (
            <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: 10, padding: '14px 18px', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span>📧</span>
              <div>
                <strong style={{ color: '#065F46' }}>Confirmation email sent to {form.email}</strong>
                <div style={{ fontSize: 13, marginTop: 4, color: '#065F46' }}>Check your inbox (and spam) for details and next steps.</div>
                <button onClick={() => setEmailPreview(true)} style={{ marginTop: 8, background: 'none', border: '1px solid #059669', color: '#065F46', borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>👁 Preview Email →</button>
              </div>
            </div>
          )}

          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#001A4D' }}>📋 What We Received</h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                ['Application Type', appType === 'returning' ? '🔄 Returning Student' : '🆕 New Student'],
                ['Admission For', admissionFor || '1st Semester'],
                ['Full Name', `${form.firstName} ${form.lastName}`],
                ['Nationality', form.nationality],
                [isForeign ? 'Passport Number' : 'SA ID Number', isForeign ? form.passportNumber : form.idNumber],
                ['Email', form.email],
                ['Phone', form.phone],
                ['Qualification', form.qualificationName],
                ['Study Year', `Year ${returningYear}`],
                ...(appType === 'returning' ? [['New Modules', `${newModules.length} modules for Year ${returningYear}`]] : []),
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 12, fontSize: 14, padding: '9px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontWeight: 600, color: '#6b7280', minWidth: 180 }}>{k}</span>
                  <span style={{ color: '#001A4D' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 8, padding: '14px 16px', marginTop: 16, fontSize: 14, color: '#3730a3' }}>
              <span>⏱</span> <strong>Next Steps:</strong> Our admissions team will review your application within <strong>3–5 business days</strong>. You'll be contacted at <strong>{form.email}</strong>.
              {appType === 'returning' && ' Once approved, you can log in and register for your new modules.'}
            </div>
            <button onClick={() => navigate('/')} style={{ marginTop: 16, width: '100%', background: '#123f7a', color: 'white', border: 'none', padding: '12px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>← Back to Home</button>
          </div>
        </div>

        {emailPreview && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,26,77,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={() => setEmailPreview(false)}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 12px 40px rgba(0,26,77,0.25)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ fontWeight: 700, fontSize: 15 }}>📧 Email Preview</div><div style={{ fontSize: 12, color: '#6b7280' }}>Sent to: {form.email}</div></div>
                <button onClick={() => setEmailPreview(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>×</button>
              </div>
              <div style={{ flex: 1, overflow: 'auto' }}>
                <iframe srcDoc={emailHtml} style={{ width: '100%', height: 600, border: 'none' }} title="Email Preview" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── STEP 0: Choose application type ──
  if (!typeConfirmed) {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f4f4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 640, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'var(--font-display, Arial)', fontSize: 32, color: '#001A4D', letterSpacing: 1, marginBottom: 8 }}>APPLICATION FOR ADMISSION</h1>
            <p style={{ color: '#6b7280', fontSize: 15 }}>Please tell us a bit about your application before we begin.</p>
          </div>

          {/* Application Type */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 28, marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#001A4D', marginBottom: 16 }}>Application Type <span style={{ color: '#e8192c' }}>*</span></div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {([
                { value: 'new', label: '🆕 New Student', desc: 'Applying to Richfield for the first time' },
                { value: 'returning', label: '🔄 Returning Student', desc: 'Previously enrolled, continuing studies' },
                { value: 'other', label: '📋 Other', desc: 'Transfer, re-admission or special cases' },
              ] as { value: AppType; label: string; desc: string }[]).map(opt => (
                <div key={opt.value as string} onClick={() => setAppType(opt.value)} style={{
                  flex: 1, minWidth: 160,
                  border: `2px solid ${appType === opt.value ? '#123f7a' : '#e5e7eb'}`,
                  borderRadius: 10, padding: '16px 14px', cursor: 'pointer',
                  background: appType === opt.value ? '#EEF2FF' : 'white',
                  transition: 'all 0.15s', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{opt.label.split(' ')[0]}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#001A4D' }}>{opt.label.split(' ').slice(1).join(' ')}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Admission Application For */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 28, marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#001A4D', marginBottom: 16 }}>Admission Application For <span style={{ color: '#e8192c' }}>*</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {(['1st Semester', '2nd Semester', '1st Year', '2nd Year', '3rd Year'] as AdmissionFor[]).map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', border: `1.5px solid ${admissionFor === opt ? '#123f7a' : '#e5e7eb'}`, borderRadius: 8, background: admissionFor === opt ? '#EEF2FF' : 'white', transition: 'all 0.15s' }}>
                  <input type="radio" name="admissionFor" value={opt} checked={admissionFor === opt} onChange={() => { setAdmissionFor(opt); if (opt.includes('Year')) setStudyYear(parseInt(opt) as 1 | 2 | 3); }}
                    style={{ accentColor: '#123f7a', width: 16, height: 16 }} />
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#001A4D' }}>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Course Applied For — only for new/other */}
          {appType !== 'returning' && (
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 28, marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#001A4D', marginBottom: 12 }}>Course Applied For</div>
              <select style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, color: '#001A4D', background: 'white' }}
                value={form.qualificationCode} onChange={e => handleQualChange(e.target.value)}>
                <option value="">Please Select</option>
                {QUALIFICATIONS.map(q => <option key={q.code} value={q.code}>{q.name}</option>)}
              </select>
            </div>
          )}

          <button
            onClick={() => {
              if (!appType) { alert('Please select an Application Type'); return; }
              if (!admissionFor) { alert('Please select what you are applying for'); return; }
              setTypeConfirmed(true);
              if (appType === 'returning') setStep(0); // start at lookup
              else setStep(0);
            }}
            style={{ width: '100%', background: appType ? '#ffc72c' : '#e5e7eb', color: appType ? '#123f7a' : '#9ca3af', border: 'none', padding: '14px', borderRadius: 8, fontSize: 16, fontWeight: 800, cursor: appType ? 'pointer' : 'not-allowed' }}>
            {appType === 'returning' ? 'Continue as Returning Student →' : 'Start New Application →'}
          </button>
        </div>
      </div>
    );
  }

  // ── RETURNING STUDENT FLOW ──
  if (appType === 'returning') {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f4f4', padding: '32px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <button onClick={() => { setTypeConfirmed(false); setStep(0); setFoundStudent(null); setLookupValue(''); setLookupError(''); }} style={{ background: 'none', border: 'none', color: '#123f7a', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>← Back to Type Selection</button>
          </div>

          {/* Stepper */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, marginBottom: 32 }}>
            {RETURNING_STEPS.map((s, i) => (
              <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
                {i < RETURNING_STEPS.length - 1 && <div style={{ position: 'absolute', top: 16, left: '50%', width: '100%', height: 2, background: i < step ? '#059669' : '#e5e7eb', zIndex: 0 }} />}
                <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, border: `2px solid ${i === step ? '#123f7a' : i < step ? '#059669' : '#e5e7eb'}`, background: i === step ? '#123f7a' : i < step ? '#059669' : 'white', color: i <= step ? 'white' : '#6b7280', position: 'relative', zIndex: 1 }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: i === step ? '#123f7a' : i < step ? '#059669' : '#6b7280', textAlign: 'center', maxWidth: 80 }}>{s}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 28 }}>

            {/* Step 0: Verify Identity */}
            {step === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, borderBottom: '2px solid #e5e7eb' }}>
                  <span style={{ fontSize: 22 }}>🔍</span>
                  <h3 style={{ fontWeight: 700, fontSize: 17, color: '#001A4D' }}>Verify Your Identity</h3>
                </div>
                <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 8, padding: '14px 16px', fontSize: 14, color: '#3730a3' }}>
                  <strong>Returning student?</strong> Enter your SA ID number or passport number below. We'll retrieve your existing details automatically — no need to fill the whole form again.
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#001A4D', marginBottom: 6 }}>SA ID Number or Passport Number <span style={{ color: '#e8192c' }}>*</span></label>
                  <input
                    className="form-input"
                    value={lookupValue}
                    onChange={e => setLookupValue(e.target.value)}
                    placeholder="Enter your ID or passport number"
                    onKeyDown={e => e.key === 'Enter' && handleLookup()}
                    style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${lookupError ? '#dc2626' : '#e5e7eb'}`, borderRadius: 8, fontSize: 14 }}
                  />
                  {lookupError && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>⚠ {lookupError}</div>}
                </div>
                <button onClick={handleLookup} style={{ background: '#123f7a', color: 'white', border: 'none', padding: '12px', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                  🔍 Find My Record
                </button>
              </div>
            )}

            {/* Step 1: Confirm & update details */}
            {step === 1 && foundStudent && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, borderBottom: '2px solid #e5e7eb' }}>
                  <span style={{ fontSize: 22 }}>✅</span>
                  <h3 style={{ fontWeight: 700, fontSize: 17, color: '#001A4D' }}>Confirm Your Details</h3>
                </div>

                <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: 8, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 20 }}>👋</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#065F46', fontSize: 15 }}>Welcome back, {foundStudent.user.name}!</div>
                    <div style={{ fontSize: 13, color: '#065F46', marginTop: 2 }}>Student ID: <strong>{foundStudent.user.studentId}</strong> · {foundStudent.application.qualificationName}</div>
                    <div style={{ fontSize: 13, color: '#065F46' }}>Applying for: <strong>{admissionFor}</strong></div>
                  </div>
                </div>

                <p style={{ fontSize: 14, color: '#6b7280' }}>Your information has been pre-filled. Please review and update anything that has changed:</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[
                    { label: 'First Name', key: 'firstName' as keyof FormData },
                    { label: 'Last Name', key: 'lastName' as keyof FormData },
                  ].map(f => (
                    <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#001A4D' }}>{f.label}</label>
                      <input value={form[f.key] as string} onChange={e => set(f.key, e.target.value)} style={{ padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 7, fontSize: 14 }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#001A4D' }}>Phone <span style={{ color: '#e8192c' }}>*</span></label>
                    <input value={form.phone} onChange={e => set('phone', e.target.value)} style={{ padding: '9px 12px', border: `1.5px solid ${errors.phone ? '#dc2626' : '#e5e7eb'}`, borderRadius: 7, fontSize: 14 }} />
                    {errors.phone && <span style={{ color: '#dc2626', fontSize: 12 }}>Required</span>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#001A4D' }}>Email <span style={{ color: '#e8192c' }}>*</span></label>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} style={{ padding: '9px 12px', border: `1.5px solid ${errors.email ? '#dc2626' : '#e5e7eb'}`, borderRadius: 7, fontSize: 14 }} />
                    {errors.email && <span style={{ color: '#dc2626', fontSize: 12 }}>Required</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#001A4D' }}>Residential Address</label>
                  <input value={form.streetAddress} onChange={e => set('streetAddress', e.target.value)} placeholder="Street, Suburb, City" style={{ padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 7, fontSize: 14 }} />
                </div>
              </div>
            )}

            {/* Step 2: New Modules for this year */}
            {step === 2 && foundStudent && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, borderBottom: '2px solid #e5e7eb' }}>
                  <span style={{ fontSize: 22 }}>📚</span>
                  <h3 style={{ fontWeight: 700, fontSize: 17, color: '#001A4D' }}>Your New Modules</h3>
                </div>

                <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 8, padding: '14px 16px', fontSize: 14, color: '#3730a3' }}>
                  Based on your <strong>{admissionFor}</strong> re-enrolment for <strong>{foundStudent.application.qualificationName}</strong>,
                  here are your <strong>Year {returningYear}</strong> modules:
                </div>

                {newModules.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                    No modules found for this year. Please contact admissions.
                  </div>
                ) : (
                  <>
                    {[1, 2].map(sem => {
                      const semMods = newModules.filter(m => m.semester === sem);
                      if (semMods.length === 0) return null;
                      return (
                        <div key={sem}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#123f7a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ background: '#123f7a', color: 'white', padding: '2px 10px', borderRadius: 99, fontSize: 12 }}>Semester {sem}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {semMods.map((m, i) => (
                              <div key={m.code} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#F4F6FB', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                                <div style={{ width: 30, height: 30, background: '#123f7a', borderRadius: 7, color: 'white', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                                  <div style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>{m.code}</div>
                                </div>
                                <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'right' }}>
                                  <div style={{ fontWeight: 700 }}>{m.credits}</div>
                                  <div>credits</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ background: 'linear-gradient(135deg, #001A4D, #123f7a)', color: 'white', borderRadius: 10, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 12, opacity: 0.75 }}>TOTAL MODULES</div>
                        <div style={{ fontWeight: 900, fontSize: 28 }}>{newModules.length}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, opacity: 0.75 }}>TOTAL CREDITS</div>
                        <div style={{ fontWeight: 900, fontSize: 28 }}>{newModules.reduce((s, m) => s + m.credits, 0)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, opacity: 0.75 }}>STUDY YEAR</div>
                        <div style={{ fontWeight: 900, fontSize: 28 }}>Year {returningYear}</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3 (last): Review & T&C */}
            {step === 3 && foundStudent && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, borderBottom: '2px solid #e5e7eb' }}>
                  <span style={{ fontSize: 22 }}>✅</span>
                  <h3 style={{ fontWeight: 700, fontSize: 17, color: '#001A4D' }}>Review & Submit</h3>
                </div>
                {[
                  { title: 'Student Details', rows: [['Name', `${form.firstName} ${form.lastName}`], ['Student ID', foundStudent.user.studentId || ''], ['Phone', form.phone], ['Email', form.email]] },
                  { title: 'Re-enrolment', rows: [['Qualification', form.qualificationName], ['Applying For', admissionFor], ['Study Year', `Year ${returningYear}`], ['New Modules', `${newModules.length} modules`]] },
                ].map(sec => (
                  <div key={sec.title} style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ background: '#f9fafb', padding: '9px 14px', fontWeight: 700, fontSize: 13, borderBottom: '1px solid #e5e7eb', color: '#001A4D' }}>{sec.title}</div>
                    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {sec.rows.map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                          <span style={{ color: '#6b7280', minWidth: 130 }}>{k}</span>
                          <span style={{ fontWeight: 600, color: '#001A4D' }}>{v || '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 8, padding: '13px 16px', fontSize: 14, color: '#3730a3' }}>
                  📧 A confirmation email will be sent to <strong>{form.email}</strong> once submitted.
                </div>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.tcAccepted} onChange={e => set('tcAccepted', e.target.checked)} style={{ width: 16, height: 16, marginTop: 2, accentColor: '#123f7a', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                    I confirm all details are correct and I accept the <strong style={{ color: '#123f7a' }}>Terms and Conditions</strong> of Richfield Graduate Institute of Technology.
                  </span>
                </label>
                {errors.tcAccepted && <div style={{ color: '#dc2626', fontSize: 12 }}>⚠ {errors.tcAccepted}</div>}
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 20, borderTop: '1px solid #e5e7eb', marginTop: 12 }}>
              <button onClick={back} disabled={step === 0} style={{ background: '#f3f4f6', color: '#374151', border: '1.5px solid #e5e7eb', padding: '10px 22px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: step === 0 ? 'not-allowed' : 'pointer', opacity: step === 0 ? 0.5 : 1 }}>← Back</button>
              {step < RETURNING_STEPS.length - 1
                ? <button onClick={next} style={{ background: '#123f7a', color: 'white', border: 'none', padding: '10px 22px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Continue →</button>
                : <button onClick={handleSubmit} style={{ background: '#ffc72c', color: '#123f7a', border: 'none', padding: '12px 28px', borderRadius: 8, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>Submit Re-enrolment 🔄</button>
              }
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── NEW / OTHER STUDENT FULL FORM ──
  const docList = isForeign
    ? ['Certified copy of Passport (all pages)', 'Study permit / visa', 'Certified copy of highest qualification', 'Proof of payment / funding letter', 'Passport photo', 'SAQA evaluation letter']
    : ['Certified copy of SA ID document', 'Certified copy of Matric certificate', 'Certified copy of tertiary qualifications', 'Proof of payment / funding letter', 'Passport photo'];

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4f4', padding: '32px 24px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ marginBottom: 8 }}>
          <button onClick={() => setTypeConfirmed(false)} style={{ background: 'none', border: 'none', color: '#123f7a', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>← Back to Type Selection</button>
        </div>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display, Arial)', fontSize: 28, color: '#001A4D', letterSpacing: 1, marginBottom: 4 }}>ONLINE APPLICATION FORM</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Complete all sections. Fields marked <span style={{ color: '#e8192c' }}>*</span> are required.</p>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 32 }}>
          {NEW_STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
              {i < NEW_STEPS.length - 1 && <div style={{ position: 'absolute', top: 16, left: '50%', width: '100%', height: 2, background: i < step ? '#059669' : '#e5e7eb', zIndex: 0 }} />}
              <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, border: `2px solid ${i === step ? '#123f7a' : i < step ? '#059669' : '#e5e7eb'}`, background: i === step ? '#123f7a' : i < step ? '#059669' : 'white', color: i <= step ? 'white' : '#6b7280', position: 'relative', zIndex: 1 }}>
                {i < step ? '✓' : i + 1}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: i === step ? '#123f7a' : '#6b7280', textAlign: 'center', maxWidth: 80 }}>{s}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Step 0: Personal */}
          {step === 0 && (
            <>
              <SH icon="👤" title="Personal Details" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FG label="First Name" required error={errors.firstName}><input className="form-input" value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="John" style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${errors.firstName ? '#dc2626' : '#e5e7eb'}`, borderRadius: 8, fontSize: 14 }} /></FG>
                <FG label="Last Name" required error={errors.lastName}><input className="form-input" value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Doe" style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${errors.lastName ? '#dc2626' : '#e5e7eb'}`, borderRadius: 8, fontSize: 14 }} /></FG>
              </div>
              <FG label="Nationality" required error={errors.nationality}>
                <select value={form.nationality} onChange={e => { set('nationality', e.target.value); if (e.target.value === 'South African') set('passportNumber', ''); else set('idNumber', ''); }} style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${errors.nationality ? '#dc2626' : '#e5e7eb'}`, borderRadius: 8, fontSize: 14, background: 'white' }}>
                  <option value="">Select nationality...</option>
                  {NATIONALITIES.map(n => <option key={n}>{n}</option>)}
                </select>
              </FG>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {!isForeign
                  ? <FG label="SA ID Number" required error={errors.idNumber}><input value={form.idNumber} onChange={e => set('idNumber', e.target.value)} placeholder="0001015009087" maxLength={13} style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${errors.idNumber ? '#dc2626' : '#e5e7eb'}`, borderRadius: 8, fontSize: 14 }} /></FG>
                  : <FG label="Passport Number" required error={errors.passportNumber}><input value={form.passportNumber} onChange={e => set('passportNumber', e.target.value.toUpperCase())} placeholder="A12345678" maxLength={20} style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${errors.passportNumber ? '#dc2626' : '#e5e7eb'}`, borderRadius: 8, fontSize: 14 }} /></FG>
                }
                <FG label="Date of Birth" required error={errors.dateOfBirth}><input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${errors.dateOfBirth ? '#dc2626' : '#e5e7eb'}`, borderRadius: 8, fontSize: 14 }} /></FG>
              </div>
              <FG label="Gender" required error={errors.gender}>
                <select value={form.gender} onChange={e => set('gender', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${errors.gender ? '#dc2626' : '#e5e7eb'}`, borderRadius: 8, fontSize: 14, background: 'white' }}>
                  <option value="">Select...</option>
                  <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
                </select>
              </FG>
              {isForeign && <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 8, padding: '13px 16px', fontSize: 14, color: '#3730a3' }}>🌍 <strong>Foreign National:</strong> You'll need to submit a certified passport copy and valid study permit/visa.</div>}
            </>
          )}

          {/* Step 1: Contact */}
          {step === 1 && (
            <>
              <SH icon="📞" title="Contact Details" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FG label="Phone" required error={errors.phone}><input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+27 XX XXX XXXX" style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${errors.phone ? '#dc2626' : '#e5e7eb'}`, borderRadius: 8, fontSize: 14 }} /></FG>
                <FG label="Email" required error={errors.email}><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${errors.email ? '#dc2626' : '#e5e7eb'}`, borderRadius: 8, fontSize: 14 }} /></FG>
              </div>
              <FG label="Alternative Email"><input type="email" value={form.altEmail} onChange={e => set('altEmail', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14 }} /></FG>
              <SH icon="🏠" title="Residential Address" />
              <FG label="Street Address" required error={errors.streetAddress}><input value={form.streetAddress} onChange={e => set('streetAddress', e.target.value)} placeholder="123 Main Street" style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${errors.streetAddress ? '#dc2626' : '#e5e7eb'}`, borderRadius: 8, fontSize: 14 }} /></FG>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FG label="Suburb"><input value={form.suburb} onChange={e => set('suburb', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14 }} /></FG>
                <FG label="City" required error={errors.city}><input value={form.city} onChange={e => set('city', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${errors.city ? '#dc2626' : '#e5e7eb'}`, borderRadius: 8, fontSize: 14 }} /></FG>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FG label="Province" required error={errors.province}>
                  {!isForeign
                    ? <select value={form.province} onChange={e => set('province', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${errors.province ? '#dc2626' : '#e5e7eb'}`, borderRadius: 8, fontSize: 14, background: 'white' }}>
                        <option value="">Select...</option>
                        {['Gauteng','Western Cape','KwaZulu-Natal','Eastern Cape','Limpopo','Mpumalanga','North West','Free State','Northern Cape'].map(p => <option key={p}>{p}</option>)}
                      </select>
                    : <input value={form.province} onChange={e => set('province', e.target.value)} placeholder="Province / Region" style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${errors.province ? '#dc2626' : '#e5e7eb'}`, borderRadius: 8, fontSize: 14 }} />
                  }
                </FG>
                <FG label="Postal Code"><input value={form.postalCode} onChange={e => set('postalCode', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14 }} /></FG>
              </div>
            </>
          )}

          {/* Step 2: Education */}
          {step === 2 && (
            <>
              <SH icon="🎓" title="High School Education" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FG label="High School Name" required error={errors.highSchool}><input value={form.highSchool} onChange={e => set('highSchool', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${errors.highSchool ? '#dc2626' : '#e5e7eb'}`, borderRadius: 8, fontSize: 14 }} /></FG>
                <FG label="Year Completed"><input type="number" value={form.highSchoolYear} onChange={e => set('highSchoolYear', e.target.value)} placeholder="2023" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14 }} /></FG>
              </div>
              <FG label="Highest Grade / Qualification" required error={errors.highestGrade}>
                <select value={form.highestGrade} onChange={e => set('highestGrade', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${errors.highestGrade ? '#dc2626' : '#e5e7eb'}`, borderRadius: 8, fontSize: 14, background: 'white' }}>
                  <option value="">Select...</option>
                  <option>Grade 12 / Matric</option><option>Grade 11</option><option>GED</option><option>N3</option>
                  {isForeign && <option>Foreign equivalent (A-Levels / Baccalaureate)</option>}
                </select>
              </FG>
              <SH icon="🏛️" title="Tertiary Education (if applicable)" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FG label="Institution"><input value={form.tertiaryInstitution} onChange={e => set('tertiaryInstitution', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14 }} /></FG>
                <FG label="Qualification"><input value={form.tertiaryQualification} onChange={e => set('tertiaryQualification', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14 }} /></FG>
              </div>
            </>
          )}

          {/* Step 3: Qualification & Payer */}
          {step === 3 && (
            <>
              <SH icon="📚" title="Qualification Selection" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {QUALIFICATIONS.map(q => (
                  <div key={q.code} onClick={() => handleQualChange(q.code)} style={{ border: `2px solid ${form.qualificationCode === q.code ? '#123f7a' : '#e5e7eb'}`, borderRadius: 8, padding: '14px 16px', cursor: 'pointer', background: form.qualificationCode === q.code ? '#EEF2FF' : 'white', transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#123f7a', fontWeight: 700 }}>{q.code}</span>
                        <div style={{ fontWeight: 600, marginTop: 2 }}>{q.name}</div>
                        <div style={{ fontSize: 13, color: '#6b7280' }}>{q.faculty} · {q.duration}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: '#123f7a' }}>R{q.fee.toLocaleString()}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>per year</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {errors.qualificationCode && <div style={{ color: '#dc2626', fontSize: 12 }}>⚠ {errors.qualificationCode}</div>}
              <SH icon="💳" title="Account Payer Details" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FG label="Payer Full Name" required error={errors.payerName}><input value={form.payerName} onChange={e => set('payerName', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${errors.payerName ? '#dc2626' : '#e5e7eb'}`, borderRadius: 8, fontSize: 14 }} /></FG>
                <FG label="Relationship">
                  <select value={form.payerRelation} onChange={e => set('payerRelation', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, background: 'white' }}>
                    <option value="">Select...</option>
                    <option>Self</option><option>Parent</option><option>Guardian</option><option>Sponsor</option><option>Employer</option>
                  </select>
                </FG>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FG label="Payer Phone" required error={errors.payerPhone}><input value={form.payerPhone} onChange={e => set('payerPhone', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${errors.payerPhone ? '#dc2626' : '#e5e7eb'}`, borderRadius: 8, fontSize: 14 }} /></FG>
                <FG label="Payer Email"><input type="email" value={form.payerEmail} onChange={e => set('payerEmail', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14 }} /></FG>
              </div>
            </>
          )}

          {/* Step 4: Documents */}
          {step === 4 && (
            <>
              <SH icon="📎" title="Required Documents" />
              {isForeign && <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '13px 16px', fontSize: 14, color: '#92400e' }}>🌍 As a foreign national, additional documents are required including study permit and SAQA evaluation.</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {docList.map(doc => (
                  <label key={doc} style={{ display: 'flex', alignItems: 'center', gap: 12, border: `1.5px solid ${form.docsUploaded.includes(doc) ? '#123f7a' : '#e5e7eb'}`, borderRadius: 8, padding: '12px 16px', cursor: 'pointer', background: form.docsUploaded.includes(doc) ? '#EEF2FF' : 'white', transition: 'all 0.15s' }}>
                    <input type="checkbox" checked={form.docsUploaded.includes(doc)} onChange={() => toggleDoc(doc)} style={{ width: 16, height: 16, accentColor: '#123f7a' }} />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{doc}</span>
                    {form.docsUploaded.includes(doc) && <span style={{ marginLeft: 'auto', color: '#059669', fontWeight: 700, fontSize: 13 }}>✓</span>}
                  </label>
                ))}
              </div>
            </>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <>
              <SH icon="✅" title="Review Your Application" />
              {[
                { title: 'Personal', rows: [['Name', `${form.firstName} ${form.lastName}`], ['Nationality', form.nationality], [isForeign ? 'Passport' : 'SA ID', isForeign ? form.passportNumber : form.idNumber], ['DOB', form.dateOfBirth], ['Gender', form.gender]] },
                { title: 'Contact', rows: [['Phone', form.phone], ['Email', form.email], ['Address', `${form.streetAddress}, ${form.city}, ${form.province}`]] },
                { title: 'Education', rows: [['High School', form.highSchool], ['Grade', form.highestGrade]] },
                { title: 'Qualification', rows: [['Code', form.qualificationCode], ['Name', form.qualificationName], ['Payer', form.payerName], ['Admission For', admissionFor]] },
              ].map(sec => (
                <div key={sec.title} style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ background: '#f9fafb', padding: '9px 14px', fontWeight: 700, fontSize: 13, borderBottom: '1px solid #e5e7eb' }}>{sec.title}</div>
                  <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {sec.rows.map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                        <span style={{ color: '#6b7280', minWidth: 130 }}>{k}</span>
                        <span style={{ fontWeight: 600 }}>{v || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 8, padding: '13px 16px', fontSize: 14, color: '#3730a3' }}>
                📧 A confirmation email will be sent to <strong>{form.email}</strong> upon submission.
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.tcAccepted} onChange={e => set('tcAccepted', e.target.checked)} style={{ width: 16, height: 16, marginTop: 2, accentColor: '#123f7a', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>I confirm all information is accurate and accept the <strong style={{ color: '#123f7a' }}>Terms and Conditions</strong> of Richfield Graduate Institute of Technology.</span>
              </label>
              {errors.tcAccepted && <div style={{ color: '#dc2626', fontSize: 12 }}>⚠ {errors.tcAccepted}</div>}
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid #e5e7eb', marginTop: 8 }}>
            <button onClick={back} disabled={step === 0} style={{ background: '#f3f4f6', color: '#374151', border: '1.5px solid #e5e7eb', padding: '10px 22px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: step === 0 ? 'not-allowed' : 'pointer', opacity: step === 0 ? 0.5 : 1 }}>← Back</button>
            {step < NEW_STEPS.length - 1
              ? <button onClick={next} style={{ background: '#123f7a', color: 'white', border: 'none', padding: '10px 22px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Continue →</button>
              : <button onClick={handleSubmit} style={{ background: '#ffc72c', color: '#123f7a', border: 'none', padding: '12px 28px', borderRadius: 8, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>Submit Application 🎓</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function SH({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12, borderBottom: '2px solid #e5e7eb' }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <h3 style={{ fontWeight: 700, fontSize: 16, color: '#001A4D' }}>{title}</h3>
    </div>
  );
}
function FG({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#001A4D' }}>{label}{required && <span style={{ color: '#e8192c', marginLeft: 2 }}>*</span>}</label>
      {children}
      {error && <div style={{ fontSize: 12, color: '#dc2626' }}>⚠ {error}</div>}
    </div>
  );
}
