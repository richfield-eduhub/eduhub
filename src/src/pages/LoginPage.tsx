import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const { login, currentUser } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (currentUser) {
    if (currentUser.role === 'admin') navigate('/admin');
    else if (currentUser.role === 'student') navigate('/student');
    else navigate('/lecturer');
  }

  const handleSubmit = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 400));
    const result = login(email, password);
    if (!result.success) { setError(result.message); setLoading(false); return; }
    // redirect handled above via currentUser change
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--rf-offwhite)',
    }}>
      {/* Left Panel */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #001A4D 0%, #003DA5 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 48px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(245,166,35,0.1)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -40, width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: 4, opacity: 0.6, marginBottom: 32 }}>EDUHUB</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 52, letterSpacing: 2, lineHeight: 1, marginBottom: 20 }}>WELCOME<br /><span style={{ color: 'var(--rf-gold)' }}>BACK.</span></h1>
          <p style={{ fontSize: 16, opacity: 0.75, lineHeight: 1.7, maxWidth: 320 }}>
            Access your student portal, manage registrations, and track your academic journey.
          </p>
          <div style={{ marginTop: 48, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 32 }}>
            <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 16 }}>DEMO ACCOUNTS</div>
            {[
              { role: 'Admin', email: 'admin@eduhub.ac.za', pwd: 'admin123' },
              { role: 'Lecturer', email: 'smokoena@eduhub.ac.za', pwd: 'lec123' },
            ].map(a => (
              <div key={a.email} onClick={() => { setEmail(a.email); setPassword(a.pwd); }} style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8, padding: '10px 14px', marginBottom: 8,
                cursor: 'pointer', transition: 'background 0.15s',
              }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{a.role}</div>
                <div style={{ fontSize: 12, opacity: 0.65, fontFamily: 'var(--font-mono)' }}>{a.email}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{
        width: 480,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 48px',
        background: 'white',
      }}>
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, letterSpacing: 1, marginBottom: 6 }}>SIGN IN</h2>
          <p style={{ color: 'var(--rf-gray)', fontSize: 14 }}>Enter your credentials to access your account</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            <span>⚠️</span> {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--rf-border)' }}>
          <p style={{ fontSize: 14, color: 'var(--rf-gray)' }}>
            New student? <Link to="/apply" style={{ color: 'var(--rf-blue)', fontWeight: 600 }}>Apply here →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
