import { useApp } from '../context/AppContext';

export default function AdminStudents() {
  const { users, applications, registrations } = useApp();
  const students = users.filter(u => u.role === 'student');

  return (
    <div className="main-content">
      <h1 className="section-title">STUDENTS</h1>
      <p className="section-subtitle">{students.length} enrolled students</p>

      <div className="card">
        {students.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--rf-gray)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎓</div>
            <div>No students enrolled yet. Approve applications to create student accounts.</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Student ID</th><th>Email</th><th>Qualification</th><th>Registration</th><th>Account</th></tr>
            </thead>
            <tbody>
              {students.map(s => {
                const app = applications.find(a => a.studentId === s.studentId && a.status === 'approved');
                const reg = registrations.find(r => r.studentId === s.studentId);
                return (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--rf-blue)' }}>{s.studentId}</td>
                    <td style={{ fontSize: 13, color: 'var(--rf-gray)' }}>{s.email}</td>
                    <td style={{ fontSize: 13 }}>{app?.qualificationCode || '—'}</td>
                    <td><span className={`badge badge-${reg ? reg.status : 'pending'}`}>{reg ? reg.status : 'Not registered'}</span></td>
                    <td><span className={`badge ${s.tempPassword ? 'badge-pending' : 'badge-approved'}`}>
                      {s.tempPassword ? '⚠ Temp password' : '✓ Active'}
                    </span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
