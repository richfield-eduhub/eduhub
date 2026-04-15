import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Registration } from '../types';

export default function AdminRegistrations() {
  const { registrations, approveRegistration, declineRegistration } = useApp();
  const [selected, setSelected] = useState<Registration | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [showDecline, setShowDecline] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('all');

  const filtered = registrations.filter(r => filter === 'all' || r.status === filter);

  const handleApprove = (reg: Registration) => { approveRegistration(reg.id); setSelected(null); };
  const handleDecline = () => {
    if (!selected || !declineReason.trim()) return;
    declineRegistration(selected.id, declineReason);
    setShowDecline(false); setDeclineReason(''); setSelected(null);
  };

  return (
    <div className="main-content">
      <h1 className="section-title">REGISTRATIONS</h1>
      <p className="section-subtitle">Review and approve module registrations</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['all', 'pending', 'approved', 'declined'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className="btn btn-sm"
            style={{ background: filter === f ? 'var(--rf-blue)' : 'white', color: filter === f ? 'white' : 'var(--rf-navy)', border: '1.5px solid var(--rf-border)', textTransform: 'capitalize' }}>
            {f} ({registrations.filter(r => f === 'all' || r.status === f).length})
          </button>
        ))}
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--rf-gray)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
            <div>No {filter === 'all' ? '' : filter} registrations found</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Student ID</th><th>Qualification</th><th>Semester/Year</th><th>Modules</th><th>Fee</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--rf-blue)' }}>{r.studentId}</td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{r.qualificationCode}</div>
                    <div style={{ fontSize: 12, color: 'var(--rf-gray)' }}>{r.qualificationName}</div>
                  </td>
                  <td style={{ fontSize: 13 }}>Sem {r.semester}, {r.year}</td>
                  <td style={{ fontSize: 13 }}>{r.modules.length} modules</td>
                  <td style={{ fontSize: 13, fontWeight: 600 }}>R{r.totalFee.toLocaleString()}</td>
                  <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => setSelected(r)}>View</button>
                      {r.status === 'pending' && (
                        <>
                          <button className="btn btn-sm btn-success" onClick={() => handleApprove(r)}>✓</button>
                          <button className="btn btn-sm btn-danger" onClick={() => { setSelected(r); setShowDecline(true); }}>✗</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* View Modal */}
      {selected && !showDecline && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <div className="modal-title">Registration Details</div>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span className={`badge badge-${selected.status}`}>{selected.status.toUpperCase()}</span>
                <span className="badge badge-info" style={{ fontFamily: 'var(--font-mono)' }}>{selected.studentId}</span>
                <span className="badge badge-info">Sem {selected.semester}, {selected.year}</span>
              </div>
              <div style={{ border: '1px solid var(--rf-border)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ background: 'var(--rf-offwhite)', padding: '10px 14px', fontWeight: 700, fontSize: 13, borderBottom: '1px solid var(--rf-border)' }}>
                  {selected.qualificationName} ({selected.qualificationCode})
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Registered Modules ({selected.modules.length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selected.modules.map(m => (
                      <div key={m.code} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 12px', background: 'var(--rf-offwhite)', borderRadius: 6 }}>
                        <span><strong style={{ fontFamily: 'var(--font-mono)' }}>{m.code}</strong> — {m.name}</span>
                        <span style={{ color: 'var(--rf-gray)' }}>{m.credits} credits</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', fontSize: 14 }}>
                <div>
                  <span style={{ color: 'var(--rf-gray)' }}>Total Fee: </span>
                  <strong>R{selected.totalFee.toLocaleString()}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--rf-gray)' }}>Fee Status: </span>
                  <span style={{ fontWeight: 700, color: selected.feePaid ? 'var(--rf-success)' : 'var(--rf-error)' }}>
                    {selected.feePaid ? '✓ Paid' : '✗ Unpaid'}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--rf-gray)' }}>Submitted: </span>
                  <strong>{new Date(selected.submittedAt).toLocaleString()}</strong>
                </div>
              </div>
              {selected.declineReason && (
                <div className="alert alert-error"><span>❌</span> {selected.declineReason}</div>
              )}
            </div>
            {selected.status === 'pending' && (
              <div className="modal-footer">
                <button className="btn btn-danger" onClick={() => setShowDecline(true)}>✗ Decline</button>
                <button className="btn btn-success" onClick={() => handleApprove(selected)}>✓ Approve Registration</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {showDecline && selected && (
        <div className="modal-overlay" onClick={() => { setShowDecline(false); setDeclineReason(''); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Decline Registration</div>
              <button className="modal-close" onClick={() => { setShowDecline(false); setDeclineReason(''); }}>×</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-warning" style={{ marginBottom: 16 }}>
                <span>⚠️</span> You are declining the registration for Student <strong>{selected.studentId}</strong>.
              </div>
              <div className="form-group">
                <label className="form-label">Reason <span className="required">*</span></label>
                <textarea className="form-textarea" value={declineReason} onChange={e => setDeclineReason(e.target.value)}
                  placeholder="Provide reason for declining (e.g. outstanding fees, prerequisites not met)..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setShowDecline(false); setDeclineReason(''); }}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDecline} disabled={!declineReason.trim()}>Confirm Decline</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
