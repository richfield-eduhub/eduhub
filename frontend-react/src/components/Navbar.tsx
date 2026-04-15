import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { EDUHUB_LOGO } from '../utils/logo';

export default function Navbar() {
  const { currentUser, notifications, logout, markNotificationRead } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  

  const userNotifs = currentUser
    ? notifications.filter(n => n.userId === currentUser.id || n.userId === currentUser.studentId)
    : [];
  const unread = userNotifs.filter(n => !n.read).length;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
    <nav style={{
      background: '#123f7a',
      color: 'white',
      padding: '0 40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
        <img src={EDUHUB_LOGO} alt="EduHub" style={{ height: 36 }} />
      </Link>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {!currentUser && (
          <>
            <NavLink to="/" label="Home" active={location.pathname === '/'} />
            <NavLink to="/programmes" label="Programmes" active={location.pathname === '/programmes'} />
            <NavLink to="/apply" label="New Application" active={location.pathname === '/apply'} highlight />
            <NavLink to="/login" label="Login" active={location.pathname === '/login'} />
          </>
        )}
        {currentUser?.role === 'admin' && (
          <>
            <NavLink to="/admin" label="Dashboard" active={location.pathname === '/admin'} />
            <NavLink to="/admin/applications" label="Applications" active={location.pathname === '/admin/applications'} />
            <NavLink to="/admin/registrations" label="Registrations" active={location.pathname === '/admin/registrations'} />
            <NavLink to="/admin/allocations" label="Allocate Modules" active={location.pathname === '/admin/allocations'} highlight />
            <NavLink to="/admin/students" label="Students" active={location.pathname === '/admin/students'} />
          </>
        )}
        {currentUser?.role === 'student' && (
          <>
            <NavLink to="/student" label="Dashboard" active={location.pathname === '/student'} />
            <NavLink to="/student/register" label="Register Modules" active={location.pathname === '/student/register'} />
            <NavLink to="/student/modules" label="My Modules" active={location.pathname === '/student/modules'} />
          </>
        )}
        {currentUser?.role === 'lecturer' && (
          <NavLink to="/lecturer" label="Dashboard" active={location.pathname === '/lecturer'} />
        )}

        {currentUser && (
          <div style={{ position: 'relative', marginLeft: 8 }}>
            <button onClick={(e) => { e.stopPropagation(); setShowNotifs(!showNotifs); }} style={{
              background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white',
              width: 38, height: 38, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, cursor: 'pointer', position: 'relative',
            }}>
              🔔
              {unread > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 16, height: 16, background: '#e8192c',
                  borderRadius: '50%', fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{unread}</span>
              )}
            </button>
            {showNotifs && (
              <div onClick={(e) => e.stopPropagation()} style={{
                position: 'fixed', right: 16, top: '70px', width: 360,
                background: 'white', borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 9999,
                overflow: 'hidden', border: '1px solid #e5e7eb',
              }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#001A4D', fontSize: 15 }}>Notifications</span>
                  {unread > 0 && <span style={{ fontSize: 12, color: '#123f7a' }}>{unread} unread</span>}
                </div>
                <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                  {userNotifs.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', color: '#6b7280', fontSize: 14 }}>No notifications yet</div>
                  ) : userNotifs.map(n => (
                    <div key={n.id} onClick={() => markNotificationRead(n.id)} style={{
                      padding: '12px 16px', borderBottom: '1px solid #e5e7eb',
                      cursor: 'pointer', background: n.read ? 'white' : '#EEF2FF',
                    }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#001A4D', marginBottom: 3 }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{n.message}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{currentUser.name}</div>
              <div style={{ fontSize: 11, opacity: 0.7, textTransform: 'capitalize' }}>{currentUser.role}</div>
            </div>
            <button onClick={handleLogout} style={{
              background: 'rgba(255,255,255,0.15)', color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>Logout</button>
          </div>
        ) : null}
      </div>

    </nav>
    {showNotifs && <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => setShowNotifs(false)} />}
    </>
  );
}

function NavLink({ to, label, active, highlight }: { to: string; label: string; active: boolean; highlight?: boolean }) {
  return (
    <Link to={to} style={{
      padding: '6px 14px', borderRadius: 6, fontSize: 14, fontWeight: highlight ? 700 : 500,
      color: highlight ? '#123f7a' : active ? 'white' : 'rgba(255,255,255,0.85)',
      background: highlight ? '#ffc72c' : active ? 'rgba(255,255,255,0.15)' : 'transparent',
      transition: 'all 0.15s', whiteSpace: 'nowrap',
    }}>{label}</Link>
  );
}
