import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { QUALIFICATIONS } from '../utils/data';

export default function StudentModules() {
  const { currentUser, registrations, applications } = useApp();
  const navigate = useNavigate();

  if (!currentUser) { navigate('/login'); return null; }

  const myApp = applications.find(a => a.studentId === currentUser.studentId && a.status === 'approved');
  const qual = QUALIFICATIONS.find(q => q.code === myApp?.qualificationCode);

  // Find all allocations for this student — could be multiple semesters
  const myAllocations = registrations.filter(r =>
    r.studentId === currentUser.studentId && r.status === 'allocated'
  ).sort((a, b) => {
    if (a.studyYear !== b.studyYear) return a.studyYear - b.studyYear;
    return a.semester - b.semester;
  });

  // Legacy: approved via old self-registration flow
  const legacyApproved = registrations.find(r =>
    r.studentId === currentUser.studentId && r.status === 'approved'
  );

  const allActive = [...myAllocations, ...(legacyApproved ? [legacyApproved] : [])];

  if (!myApp) {
    return (
      <div className="main-content">
        <h1 className="section-title">MY MODULES</h1>
        <div className="alert alert-warning">
          <span>⏳</span>
          <div>Your application is still being reviewed. You'll be able to view your allocated modules once approved.</div>
        </div>
      </div>
    );
  }

  if (allActive.length === 0) {
    return (
      <div className="main-content">
        <h1 className="section-title">MY MODULES</h1>
        <div style={{ background: 'linear-gradient(135deg,#001A4D,#123f7a)', color: 'white', borderRadius: 12, padding: '28px 32px', marginBottom: 24 }}>
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>ENROLLED IN</div>
          <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 4 }}>{myApp.qualificationName}</div>
          <div style={{ fontSize: 13, opacity: 0.75 }}>{qual?.faculty} · {qual?.duration}</div>
        </div>
        <div style={{ textAlign: 'center', padding: '52px 20px', background: 'white', borderRadius: 12, border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📭</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#001A4D', marginBottom: 8 }}>No modules allocated yet</div>
          <div style={{ fontSize: 14, color: '#6b7280', maxWidth: 380, margin: '0 auto', lineHeight: 1.6 }}>
            Your modules haven't been assigned yet. The admissions office will allocate your modules and you'll receive a notification once they're ready.
          </div>
          <div style={{ marginTop: 20, fontSize: 13, color: '#6b7280' }}>
            Questions? Contact us at <strong>admissions@richfield.ac.za</strong>
          </div>
        </div>
      </div>
    );
  }

  const totalModules = allActive.reduce((s, r) => s + r.modules.length, 0);
  const totalCredits = allActive.reduce((s, r) => r.modules.reduce((ms, m) => ms + m.credits, s), 0);

  return (
    <div className="main-content">
      <h1 className="section-title">MY MODULES</h1>
      <p className="section-subtitle">Modules allocated by the admissions office</p>

      {/* Qualification banner */}
      <div style={{ background: 'linear-gradient(135deg,#001A4D,#123f7a)', color: 'white', borderRadius: 12, padding: '24px 28px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 4, letterSpacing: 1 }}>ENROLLED IN</div>
          <div style={{ fontWeight: 800, fontSize: 20 }}>{myApp.qualificationName}</div>
          <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>{qual?.faculty} · {qual?.duration}</div>
        </div>
        <div style={{ display: 'flex', gap: 20, textAlign: 'center' }}>
          {[['📚', totalModules, 'Total Modules'], ['⭐', totalCredits, 'Total Credits']].map(([icon, val, lbl]) => (
            <div key={lbl as string}>
              <div style={{ fontSize: 24 }}>{icon}</div>
              <div style={{ fontWeight: 900, fontSize: 26 }}>{val}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Each allocation (one card per semester/year) */}
      {allActive.map(reg => (
        <div key={reg.id} style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', marginBottom: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {/* Card header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '2px solid #e5e7eb', background: '#F4F6FB' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#001A4D' }}>
                Year {reg.studyYear} — Semester {reg.semester}
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                {reg.year} Academic Year &nbsp;·&nbsp; {reg.modules.length} modules &nbsp;·&nbsp;
                {reg.modules.reduce((s, m) => s + m.credits, 0)} credits
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 99, background: '#D1FAE5', color: '#065f46' }}>
                ✅ Allocated
              </span>
              {reg.allocatedAt && (
                <span style={{ fontSize: 11, color: '#6b7280' }}>
                  {new Date(reg.allocatedAt).toLocaleDateString('en-ZA')}
                </span>
              )}
            </div>
          </div>

          {/* Modules list */}
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reg.modules.map((m, i) => (
              <div key={m.code} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: '#F4F6FB', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <div style={{ width: 32, height: 32, background: '#123f7a', borderRadius: 8, color: 'white', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#001A4D' }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace', marginTop: 2 }}>{m.code}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#123f7a' }}>{m.credits}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>credits</div>
                </div>
              </div>
            ))}
          </div>

          {/* Fee summary */}
          <div style={{ padding: '14px 20px', borderTop: '1px solid #e5e7eb', background: '#F4F6FB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ fontSize: 14, color: '#374151' }}>
              Semester Fee: <strong style={{ color: '#001A4D' }}>R{reg.totalFee.toLocaleString()}</strong>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 99, background: reg.feePaid ? '#D1FAE5' : '#FEE2E2', color: reg.feePaid ? '#065f46' : '#dc2626' }}>
              {reg.feePaid ? '✓ Fee Paid' : '✗ Fee Outstanding'}
            </span>
          </div>
        </div>
      ))}

      <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 10, padding: '14px 18px', fontSize: 14, color: '#3730a3', marginTop: 8 }}>
        📞 For queries about your module allocation, contact <strong>admissions@richfield.ac.za</strong> or call <strong>0860 742 434</strong>.
      </div>
    </div>
  );
}
