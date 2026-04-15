import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { applications, registrations, users, notifications } = useApp();

  const pending = applications.filter(a => a.status === 'pending').length;
  const approved = applications.filter(a => a.status === 'approved').length;
  const students = users.filter(u => u.role === 'student').length;
  const pendingReg = registrations.filter(r => r.status === 'pending').length;

  const recent = [...applications].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).slice(0, 5);

  return (
    <div className="main-content">
      <h1 className="section-title">ADMIN DASHBOARD</h1>
      <p className="section-subtitle">Overview of applications, registrations and student activity</p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { icon: '📋', label: 'Pending Applications', value: pending, color: '#FEF3C7', iconBg: '#F59E0B' },
          { icon: '✅', label: 'Approved Students', value: approved, color: '#D1FAE5', iconBg: '#059669' },
          { icon: '🎓', label: 'Registered Students', value: students, color: '#E0E7FF', iconBg: '#4F46E5' },
          { icon: '📝', label: 'Pending Registrations', value: pendingReg, color: '#FCE7F3', iconBg: '#DB2777' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
            </div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Applications */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontWeight: 700, fontSize: 15 }}>Recent Applications</span>
            <Link to="/admin/applications" className="btn btn-sm btn-secondary">View All</Link>
          </div>
          <div style={{ overflow: 'hidden' }}>
            {recent.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--rf-gray)', fontSize: 14 }}>No applications yet</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Qualification</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {recent.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600 }}>{a.firstName} {a.lastName}</td>
                      <td style={{ color: 'var(--rf-gray)', fontSize: 13 }}>{a.qualificationCode}</td>
                      <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header"><span style={{ fontWeight: 700, fontSize: 15 }}>Quick Actions</span></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { to: '/admin/applications', icon: '📋', label: 'Review Applications', desc: `${pending} pending review` },
              { to: '/admin/registrations', icon: '📝', label: 'Review Registrations', desc: `${pendingReg} pending approval` },
              { to: '/admin/students', icon: '🎓', label: 'Manage Students', desc: `${students} enrolled students` },
            ].map(a => (
              <Link key={a.to} to={a.to} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px',
                border: '1.5px solid var(--rf-border)',
                borderRadius: 'var(--radius)',
                transition: 'all 0.15s',
                color: 'var(--rf-navy)',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--rf-blue)'; (e.currentTarget as HTMLElement).style.background = 'var(--rf-light)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--rf-border)'; (e.currentTarget as HTMLElement).style.background = ''; }}>
                <span style={{ fontSize: 24 }}>{a.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{a.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--rf-gray)' }}>{a.desc}</div>
                </div>
                <span style={{ marginLeft: 'auto', color: 'var(--rf-blue)' }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><span style={{ fontWeight: 700, fontSize: 15 }}>Recent Activity</span></div>
        <div style={{ overflow: 'hidden' }}>
          {notifications.slice(0, 6).length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--rf-gray)', fontSize: 14 }}>No activity yet</div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Event</th><th>Message</th><th>Time</th></tr></thead>
              <tbody>
                {notifications.slice(0, 6).map(n => (
                  <tr key={n.id}>
                    <td><span className={`badge badge-${n.type === 'success' ? 'approved' : n.type === 'error' ? 'declined' : 'info'}`}>{n.title}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--rf-gray)', maxWidth: 300 }}>{n.message.substring(0, 80)}{n.message.length > 80 ? '...' : ''}</td>
                    <td style={{ fontSize: 12, color: 'var(--rf-gray)' }}>{new Date(n.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
