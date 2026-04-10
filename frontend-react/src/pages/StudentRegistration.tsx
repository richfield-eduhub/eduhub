import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';

export default function StudentRegistration() {
  const { currentUser, applications, registrations } = useApp();

  const myApp = applications.find(a => a.studentId === currentUser?.studentId && a.status === 'approved');
  const myAllocations = registrations.filter(r => r.studentId === currentUser?.studentId && r.status === 'allocated');

  // No approved application yet
  if (!myApp) {
    return (
      <div className="main-content">
        <h1 className="section-title">MODULE REGISTRATION</h1>
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '48px 32px', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>⏳</div>
          <h2 style={{ color: '#001A4D', fontWeight: 800, marginBottom: 10 }}>Application Pending</h2>
          <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.7 }}>
            Your application is still being reviewed by the admissions team. Once approved, your modules will be allocated to you.
          </p>
          <div style={{ marginTop: 24, fontSize: 13, color: '#9ca3af' }}>
            Questions? Contact <strong style={{ color: '#123f7a' }}>admissions@eduhub.ac.za</strong>
          </div>
        </div>
      </div>
    );
  }

  // Already has allocations — redirect them to My Modules
  if (myAllocations.length > 0) {
    return (
      <div className="main-content">
        <h1 className="section-title">MODULE REGISTRATION</h1>
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '48px 32px', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h2 style={{ color: '#059669', fontWeight: 800, marginBottom: 10 }}>Modules Already Allocated</h2>
          <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
            Your modules have been allocated by the admissions office.
            You have <strong style={{ color: '#001A4D' }}>{myAllocations.reduce((s, r) => s + r.modules.length, 0)} modules</strong> across {myAllocations.length} semester{myAllocations.length > 1 ? 's' : ''}.
          </p>
          <Link to="/student/modules" style={{ display: 'inline-block', background: '#123f7a', color: 'white', padding: '12px 28px', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
            View My Modules →
          </Link>
        </div>
      </div>
    );
  }

  // Approved but no modules allocated yet — waiting screen
  return (
    <div className="main-content">
      <h1 className="section-title">MODULE REGISTRATION</h1>

      {/* Application confirmed card */}
      <div style={{ background: 'linear-gradient(135deg,#001A4D,#123f7a)', color: 'white', borderRadius: 12, padding: '24px 28px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: 1, marginBottom: 4 }}>ENROLLED IN</div>
          <div style={{ fontWeight: 800, fontSize: 20 }}>{myApp.qualificationName}</div>
          <div style={{ fontSize: 13, opacity: 0.75, marginTop: 3 }}>Student ID: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{myApp.studentId}</span></div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 18px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>STUDY YEAR</div>
          <div style={{ fontWeight: 900, fontSize: 26 }}>Year {myApp.studyYear}</div>
        </div>
      </div>

      {/* Waiting state */}
      <div style={{ background: 'white', borderRadius: 12, border: '2px dashed #C7D2FE', padding: '56px 32px', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
        {/* Animated waiting indicator */}
        <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 24px' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '4px solid #EEF2FF' }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '4px solid transparent', borderTopColor: '#123f7a', animation: 'spin 1.2s linear infinite' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>📚</div>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        <h2 style={{ color: '#001A4D', fontWeight: 800, fontSize: 22, marginBottom: 12 }}>
          Waiting for Module Allocation
        </h2>
        <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.8, maxWidth: 420, margin: '0 auto 24px' }}>
          Your application has been <strong style={{ color: '#059669' }}>approved</strong> — great news!
          The admissions office is preparing your module schedule for <strong style={{ color: '#001A4D' }}>Year {myApp.studyYear}</strong>.
          You'll receive a notification as soon as your modules are ready.
        </p>

        {/* Steps */}
        <div style={{ display: 'flex', gap: 0, justifyContent: 'center', marginBottom: 28 }}>
          {[
            { icon: '📝', label: 'Applied', done: true },
            { icon: '✅', label: 'Approved', done: true },
            { icon: '📚', label: 'Modules Allocated', done: false, active: true },
            { icon: '🎓', label: 'Classes Begin', done: false },
          ].map((s, i) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 80 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: s.done ? '#059669' : s.active ? '#123f7a' : '#e5e7eb',
                  color: s.done || s.active ? 'white' : '#9ca3af',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: s.done ? 16 : 18,
                  border: s.active ? '3px solid #ffc72c' : 'none',
                }}>
                  {s.done ? '✓' : s.icon}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: s.done ? '#059669' : s.active ? '#123f7a' : '#9ca3af', textAlign: 'center', lineHeight: 1.3 }}>{s.label}</div>
              </div>
              {i < 3 && <div style={{ width: 20, height: 2, background: s.done ? '#059669' : '#e5e7eb', marginBottom: 20, flexShrink: 0 }} />}
            </div>
          ))}
        </div>

        <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 8, padding: '13px 18px', fontSize: 14, color: '#3730a3', display: 'inline-block', textAlign: 'left', maxWidth: 380 }}>
          🔔 <strong>Tip:</strong> Check the notification bell (🔔) in the top navbar — you'll see an alert the moment your modules are allocated.
        </div>

        <div style={{ marginTop: 20, fontSize: 13, color: '#9ca3af' }}>
          Need help? Contact <strong style={{ color: '#123f7a' }}>admissions@eduhub.ac.za</strong> · <strong style={{ color: '#123f7a' }}>0860 742 434</strong>
        </div>
      </div>
    </div>
  );
}
