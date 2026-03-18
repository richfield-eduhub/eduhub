import { useApp } from '../context/AppContext';

export default function LecturerDashboard() {
  const { currentUser, registrations, users } = useApp();
  const approvedRegs = registrations.filter(r => r.status === 'approved');
  const students = users.filter(u => u.role === 'student');

  return (
    <div className="main-content">
      <h1 className="section-title">LECTURER PORTAL</h1>
      <p className="section-subtitle">Welcome, {currentUser?.name}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { icon: '🎓', label: 'Total Students', value: students.length, bg: '#E0E7FF' },
          { icon: '📝', label: 'Active Registrations', value: approvedRegs.length, bg: '#D1FAE5' },
          { icon: '📚', label: 'Programmes Running', value: new Set(approvedRegs.map(r => r.qualificationCode)).size, bg: '#FEF3C7' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><span>{s.icon}</span></div>
            <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><span style={{ fontWeight: 700 }}>Enrolled Students by Programme</span></div>
        <table className="data-table">
          <thead><tr><th>Student</th><th>Student ID</th><th>Programme</th><th>Semester</th><th>Modules</th></tr></thead>
          <tbody>
            {approvedRegs.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--rf-gray)' }}>No enrolled students yet</td></tr>
            ) : approvedRegs.map(r => {
              const student = users.find(u => u.studentId === r.studentId);
              return (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{student?.name || 'Unknown'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--rf-blue)' }}>{r.studentId}</td>
                  <td>{r.qualificationName}</td>
                  <td>Sem {r.semester}, {r.year}</td>
                  <td>{r.modules.length} modules</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
