import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function StudentDashboard() {
  const { currentUser, applications, registrations, notifications, changePassword } = useApp();
  const navigate = useNavigate();

  if (!currentUser) { navigate('/login'); return null; }

  const myApp = applications.find(a => a.studentId === currentUser.studentId && a.status === 'approved');
  const myReg = registrations.filter(r => r.studentId === currentUser.studentId);
  const myNotifs = notifications.filter(n => n.userId === currentUser.id || n.userId === currentUser.studentId);

  const handlePasswordChange = () => {
    const pwd = prompt('Enter new password (min 8 characters):');
    if (pwd && pwd.length >= 8) {
      changePassword(currentUser.id, pwd);
      alert('Password changed successfully!');
    } else if (pwd) {
      alert('Password must be at least 8 characters.');
    }
  };

  return (
    <div className="main-content">
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--rf-navy) 0%, var(--rf-blue) 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 32px',
        color: 'white',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6, letterSpacing: 1 }}>STUDENT PORTAL</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: 1, marginBottom: 6 }}>
            WELCOME, {currentUser.name.split(' ')[0].toUpperCase()}!
          </h1>
          <div style={{ display: 'flex', gap: 20, fontSize: 13, opacity: 0.85, flexWrap: 'wrap' }}>
            <span>🆔 {currentUser.studentId}</span>
            {myApp && <span>📚 {myApp.qualificationName}</span>}
            {currentUser.tempPassword && (
              <span onClick={handlePasswordChange} style={{
                cursor: 'pointer',
                background: 'rgba(245,166,35,0.3)',
                border: '1px solid rgba(245,166,35,0.5)',
                padding: '2px 10px',
                borderRadius: 99,
                color: 'var(--rf-gold)',
                fontWeight: 700,
              }}>⚠ Change temporary password</span>
            )}
          </div>
        </div>
      </div>

      {currentUser.tempPassword && (
        <div className="alert alert-warning" style={{ marginBottom: 20 }}>
          <span>🔑</span>
          <div>
            <strong>Action Required:</strong> You are using a temporary password. Please{' '}
            <button onClick={handlePasswordChange} style={{ background: 'none', border: 'none', color: 'var(--rf-blue)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
              change your password now
            </button>.
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Application Status */}
        <div className="card">
          <div className="card-header"><span style={{ fontWeight: 700 }}>Application Status</span></div>
          <div className="card-body">
            {myApp ? (
              <>
                <span className="badge badge-approved" style={{ marginBottom: 12 }}>✓ Approved</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    ['Qualification', myApp.qualificationName],
                    ['Code', myApp.qualificationCode],
                    ['Applied', new Date(myApp.submittedAt).toLocaleDateString()],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--rf-gray)' }}>{k}</span>
                      <span style={{ fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--rf-gray)', padding: '20px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                <div style={{ fontSize: 14 }}>No approved application yet</div>
              </div>
            )}
          </div>
        </div>

        {/* Module Allocation Status */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontWeight: 700 }}>Module Allocation</span>
            {myReg.some(r => r.status === 'allocated') && <Link to="/student/modules" className="btn btn-sm btn-primary">View Modules →</Link>}
          </div>
          <div className="card-body">
            {myReg.some(r => r.status === 'allocated') ? (
              <>
                <span className="badge badge-approved" style={{ marginBottom: 12 }}>✅ Modules Allocated</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {myReg.filter(r => r.status === 'allocated').map(r => (
                    <div key={r.id} style={{ fontSize: 13 }}>
                      <strong>{r.modules.length}</strong> modules · Year {r.studyYear}, Sem {r.semester}
                    </div>
                  ))}
                  <Link to="/student/modules" style={{ fontSize: 13, color: 'var(--rf-blue)', fontWeight: 600, marginTop: 4 }}>View my modules →</Link>
                </div>
              </>
            ) : myApp ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#001A4D', marginBottom: 4 }}>Awaiting Module Allocation</div>
                <div style={{ fontSize: 13, color: 'var(--rf-gray)', lineHeight: 1.6 }}>
                  Your application is approved. The admissions office will assign your modules shortly.
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--rf-gray)', padding: '20px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                <div style={{ fontSize: 14 }}>Modules will be allocated once your application is approved</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <div className="card-header"><span style={{ fontWeight: 700 }}>Notifications</span></div>
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {myNotifs.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--rf-gray)', fontSize: 14 }}>No notifications yet</div>
          ) : myNotifs.map(n => (
            <div key={n.id} style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--rf-border)',
              background: n.read ? 'white' : '#EEF2FF',
            }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18 }}>
                  {n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : n.type === 'warning' ? '⚠️' : 'ℹ️'}
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{n.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--rf-gray)', marginTop: 2, lineHeight: 1.6 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
