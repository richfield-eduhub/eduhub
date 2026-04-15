import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QUALIFICATIONS } from '../utils/data';
import type { Application, Module } from '../types';
import { sendApprovalEmail, buildApprovalEmailHtml } from '../utils/email';
import { EMAILJS_CONFIGURED } from '../utils/emailConfig';

type Toast = { message: string; type: 'success' | 'error' | 'info' } | null;

export default function AdminApplications() {
  const { applications, registrations, approveApplication, declineApplication, allocateModules } = useApp();
  const [selected, setSelected] = useState<Application | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [showDecline, setShowDecline] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('all');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [emailPreviewApp, setEmailPreviewApp] = useState<{ html: string; to: string } | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  // ── Allocate Modules state ──
  const [allocateApp, setAllocateApp] = useState<Application | null>(null);
  const [allocSemester, setAllocSemester] = useState<1 | 2>(1);
  const [allocYear, setAllocYear] = useState<1 | 2 | 3>(1);
  const [allocSelected, setAllocSelected] = useState<string[]>([]); // module codes

  const filtered = applications.filter(a => filter === 'all' || a.status === filter);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', ms = 4500) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), ms);
  };

  // Check if a student already has an allocation for a given semester+year
  const existingAllocation = (studentId: string, sem: 1 | 2, yr: 1 | 2 | 3) =>
    registrations.find(r => r.studentId === studentId && r.semester === sem && r.studyYear === yr && r.status === 'allocated');

  // ── Approve ──
  const handleApprove = async (app: Application) => {
    const isNewFirstYear = app.applicationType === 'new' && app.studyYear === 1;
    setApprovingId(app.id);
    const result = approveApplication(app.id);

    if (isNewFirstYear && result?.isNew && result.tempPassword) {
      const emailData = {
        firstName: app.firstName, lastName: app.lastName, email: app.email,
        studentId: app.studentId, applicationId: app.id,
        qualificationName: app.qualificationName, qualificationCode: app.qualificationCode,
        tempPassword: result.tempPassword, docsUploaded: app.docsUploaded,
        nationality: app.nationality, admittedFor: app.admissionFor || '1st Year',
        submittedAt: app.submittedAt,
      };
      const emailResult = await sendApprovalEmail(emailData);
      if (emailResult.message === 'dev_mode') {
        showToast('✅ Approved! Now allocate modules using the 📚 button.', 'info', 6000);
      } else if (emailResult.success) {
        showToast(`✅ Approved & email sent to ${app.email}. Now allocate modules.`, 'success', 6000);
      } else {
        showToast(`✅ Approved (email failed: ${emailResult.message}). Allocate modules below.`, 'error', 7000);
      }
    } else {
      showToast('✅ Application approved. Now allocate modules using the 📚 button.', 'info', 5000);
    }
    setApprovingId(null);
    setSelected(null);
  };

  // ── Decline ──
  const handleDecline = () => {
    if (!selected || !declineReason.trim()) return;
    declineApplication(selected.id, declineReason);
    setShowDecline(false); setDeclineReason(''); setSelected(null);
    showToast('Application declined.', 'info');
  };

  // ── Open allocation modal ──
  const openAllocate = (app: Application) => {
    setAllocateApp(app);
    const yr = (app.studyYear || 1) as 1 | 2 | 3;
    setAllocYear(yr);
    setAllocSemester(1);
    setAllocSelected([]);
  };

  // ── Available modules for allocation ──
  const allocQual = allocateApp ? QUALIFICATIONS.find(q => q.code === allocateApp.qualificationCode) : null;
  const allocModules: Module[] = allocQual
    ? allocQual.modules.filter(m => m.semester === allocSemester && m.year === allocYear)
    : [];

  const toggleAllocMod = (code: string) =>
    setAllocSelected(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);

  const confirmAllocation = () => {
    if (!allocateApp || allocSelected.length === 0) return;
    const mods = allocModules.filter(m => allocSelected.includes(m.code));
    allocateModules(allocateApp.id, mods, allocSemester, allocYear);
    showToast(`✅ ${mods.length} modules allocated to ${allocateApp.firstName} ${allocateApp.lastName}!`, 'success');
    setAllocateApp(null);
    setAllocSelected([]);
  };

  const openEmailPreview = (app: Application) => {
    const html = buildApprovalEmailHtml({
      firstName: app.firstName, lastName: app.lastName, email: app.email,
      studentId: app.studentId, applicationId: app.id,
      qualificationName: app.qualificationName, qualificationCode: app.qualificationCode,
      tempPassword: '••••••••', docsUploaded: app.docsUploaded,
      nationality: app.nationality, admittedFor: app.admissionFor || '1st Year',
      submittedAt: app.submittedAt,
    });
    setEmailPreviewApp({ html, to: app.email });
  };

  return (
    <div className="main-content">
      <h1 className="section-title">APPLICATIONS</h1>
      <p className="section-subtitle">Review, approve and allocate modules to students</p>

      {!EMAILJS_CONFIGURED && (
        <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10, padding: '12px 18px', marginBottom: 20, fontSize: 14, color: '#92400e', display: 'flex', gap: 10 }}>
          <span>⚠️</span>
          <div>Email sending is in demo mode. Open <code>src/utils/emailConfig.ts</code> to configure EmailJS.
            <button onClick={() => window.open('https://www.emailjs.com', '_blank')} style={{ background: 'none', border: 'none', color: '#92400e', textDecoration: 'underline', cursor: 'pointer', fontSize: 14, padding: '0 4px' }}>Set up free →</button>
          </div>
        </div>
      )}

      {/* Workflow hint */}
      <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontSize: 14, color: '#3730a3' }}>
        <strong>Workflow:</strong> &nbsp;
        <span style={{ opacity: 0.8 }}>
          ① Student applies &amp; picks course &nbsp;→&nbsp;
          ② Admin approves application &nbsp;→&nbsp;
          ③ Admin allocates modules (📚) &nbsp;→&nbsp;
          ④ Student sees their modules on the portal
        </span>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['all', 'pending', 'approved', 'declined'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className="btn btn-sm"
            style={{ background: filter === f ? 'var(--rf-blue)' : 'white', color: filter === f ? 'white' : 'var(--rf-navy)', border: '1.5px solid var(--rf-border)', textTransform: 'capitalize' }}>
            {f} ({applications.filter(a => f === 'all' || a.status === f).length})
          </button>
        ))}
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--rf-gray)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div>No {filter === 'all' ? '' : filter} applications found</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Student</th><th>Type</th><th>Qualification</th><th>Submitted</th><th>Status</th><th>Modules</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const alloc = existingAllocation(a.studentId, 1, (a.studyYear || 1) as 1|2|3)
                           || existingAllocation(a.studentId, 2, (a.studyYear || 1) as 1|2|3);
                return (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.firstName} {a.lastName}</div>
                      <div style={{ fontSize: 12, color: 'var(--rf-gray)' }}>{a.email}</div>
                      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--rf-blue)' }}>{a.studentId}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: a.applicationType === 'returning' ? '#FEF3C7' : '#D1FAE5', color: a.applicationType === 'returning' ? '#92400e' : '#065f46' }}>
                        {a.applicationType === 'returning' ? '🔄 Returning' : '🆕 New'}
                      </span>
                      <div style={{ fontSize: 11, color: 'var(--rf-gray)', marginTop: 2 }}>Year {a.studyYear}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{a.qualificationCode}</div>
                      <div style={{ fontSize: 12, color: 'var(--rf-gray)' }}>{a.qualificationName}</div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--rf-gray)' }}>{new Date(a.submittedAt).toLocaleDateString()}</td>
                    <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                    <td>
                      {alloc
                        ? <span style={{ fontSize: 12, color: '#059669', fontWeight: 700 }}>✅ {alloc.modules.length} allocated</span>
                        : a.status === 'approved'
                          ? <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>⏳ Pending allocation</span>
                          : <span style={{ fontSize: 12, color: 'var(--rf-gray)' }}>—</span>
                      }
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => setSelected(a)}>View</button>
                        {a.status === 'approved' && (
                          <button className="btn btn-sm" onClick={() => openAllocate(a)}
                            style={{ background: alloc ? '#D1FAE5' : '#001A4D', color: alloc ? '#065f46' : 'white', border: 'none', fontWeight: 700 }}>
                            📚 {alloc ? 'Reallocate' : 'Allocate'}
                          </button>
                        )}
                        {a.status === 'approved' && (
                          <button className="btn btn-sm" onClick={() => openEmailPreview(a)}
                            style={{ background: '#EEF2FF', color: '#3730a3', border: '1px solid #C7D2FE', fontSize: 12 }}>
                            📧
                          </button>
                        )}
                        {a.status === 'pending' && (
                          <>
                            <button className="btn btn-sm btn-success" disabled={approvingId === a.id} onClick={() => handleApprove(a)}>
                              {approvingId === a.id ? '⏳' : '✓'} Approve
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => { setSelected(a); setShowDecline(true); }}>✗</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── ALLOCATE MODULES MODAL ── */}
      {allocateApp && (
        <div className="modal-overlay" onClick={() => setAllocateApp(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 680, maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg,#001A4D,#123f7a)', color: 'white', borderRadius: '12px 12px 0 0' }}>
              <div>
                <div className="modal-title" style={{ color: 'white', fontSize: 17 }}>📚 Allocate Modules</div>
                <div style={{ fontSize: 13, opacity: 0.75, marginTop: 2 }}>{allocateApp.firstName} {allocateApp.lastName} · {allocateApp.studentId}</div>
              </div>
              <button className="modal-close" onClick={() => setAllocateApp(null)} style={{ color: 'white', opacity: 0.7, fontSize: 22 }}>×</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Student summary */}
              <div style={{ background: '#F4F6FB', borderRadius: 8, padding: '14px 16px', fontSize: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    ['Qualification', `${allocateApp.qualificationName} (${allocateApp.qualificationCode})`],
                    ['Application For', allocateApp.admissionFor || '1st Year'],
                    ['Email', allocateApp.email],
                    ['Nationality', allocateApp.nationality],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: 11, color: 'var(--rf-gray)', fontWeight: 600, textTransform: 'uppercase' }}>{k}</div>
                      <div style={{ fontWeight: 600 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Semester & Year selectors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--rf-navy)', marginBottom: 8 }}>Study Year</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {([1, 2, 3] as const).map(y => (
                      <button key={y} onClick={() => { setAllocYear(y); setAllocSelected([]); }}
                        style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: `2px solid ${allocYear === y ? '#123f7a' : '#e5e7eb'}`, background: allocYear === y ? '#123f7a' : 'white', color: allocYear === y ? 'white' : '#374151', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                        Year {y}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--rf-navy)', marginBottom: 8 }}>Semester</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {([1, 2] as const).map(s => (
                      <button key={s} onClick={() => { setAllocSemester(s); setAllocSelected([]); }}
                        style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: `2px solid ${allocSemester === s ? '#123f7a' : '#e5e7eb'}`, background: allocSemester === s ? '#123f7a' : 'white', color: allocSemester === s ? 'white' : '#374151', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                        Semester {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Existing allocation warning */}
              {existingAllocation(allocateApp.studentId, allocSemester, allocYear) && (
                <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '12px 16px', fontSize: 14, color: '#92400e' }}>
                  ⚠️ This student already has an allocation for Semester {allocSemester}, Year {allocYear}. Saving will <strong>replace</strong> it.
                </div>
              )}

              {/* Select all / none */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--rf-navy)' }}>
                  Available Modules — Semester {allocSemester}, Year {allocYear}
                  <span style={{ fontSize: 12, color: 'var(--rf-gray)', fontWeight: 400, marginLeft: 8 }}>({allocModules.length} modules)</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setAllocSelected(allocModules.map(m => m.code))}
                    style={{ fontSize: 12, padding: '4px 12px', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', background: 'white', fontWeight: 600 }}>
                    Select All
                  </button>
                  <button onClick={() => setAllocSelected([])}
                    style={{ fontSize: 12, padding: '4px 12px', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', background: 'white', fontWeight: 600 }}>
                    Clear
                  </button>
                </div>
              </div>

              {allocModules.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px', color: 'var(--rf-gray)', background: '#F4F6FB', borderRadius: 8 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                  No modules found for this qualification, year and semester.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {allocModules.map(m => {
                    const checked = allocSelected.includes(m.code);
                    return (
                      <label key={m.code} onClick={() => toggleAllocMod(m.code)} style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        border: `2px solid ${checked ? '#123f7a' : '#e5e7eb'}`,
                        borderRadius: 10, padding: '13px 16px', cursor: 'pointer',
                        background: checked ? '#EEF2FF' : 'white',
                        transition: 'all 0.15s',
                      }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: 5, border: `2px solid ${checked ? '#123f7a' : '#d1d5db'}`,
                          background: checked ? '#123f7a' : 'white', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}>
                          {checked && <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>✓</span>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: checked ? '#001A4D' : '#374151' }}>{m.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--rf-gray)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{m.code}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#123f7a' }}>{m.credits}</div>
                          <div style={{ fontSize: 11, color: 'var(--rf-gray)' }}>credits</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Summary bar */}
              {allocSelected.length > 0 && (
                <div style={{ background: 'linear-gradient(135deg,#001A4D,#123f7a)', color: 'white', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>SELECTED MODULES</div>
                    <div style={{ fontWeight: 900, fontSize: 26 }}>{allocSelected.length}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>TOTAL CREDITS</div>
                    <div style={{ fontWeight: 900, fontSize: 26 }}>
                      {allocModules.filter(m => allocSelected.includes(m.code)).reduce((s, m) => s + m.credits, 0)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>SEMESTER / YEAR</div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>Sem {allocSemester} · Year {allocYear}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setAllocateApp(null)}>Cancel</button>
              <button className="btn btn-success" disabled={allocSelected.length === 0} onClick={confirmAllocation}
                style={{ opacity: allocSelected.length === 0 ? 0.5 : 1 }}>
                ✅ Confirm Allocation ({allocSelected.length} modules)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {selected && !showDecline && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <div className="modal-title">Application: {selected.firstName} {selected.lastName}</div>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span className={`badge badge-${selected.status}`}>{selected.status.toUpperCase()}</span>
                <span className="badge badge-info" style={{ fontFamily: 'var(--font-mono)' }}>{selected.studentId}</span>
                <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: selected.applicationType === 'returning' ? '#FEF3C7' : '#D1FAE5', color: selected.applicationType === 'returning' ? '#92400e' : '#065f46' }}>
                  {selected.applicationType === 'returning' ? '🔄 Returning Student' : '🆕 New Student'}
                </span>
              </div>
              {selected.applicationType === 'new' && selected.status === 'pending' && (
                <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: 8, padding: '12px 16px', fontSize: 14, color: '#065f46' }}>
                  📧 Approving a <strong>new first-year</strong> student will automatically send them a welcome email with login credentials and document checklist.
                </div>
              )}
              {selected.status === 'approved' && !existingAllocation(selected.studentId, 1, (selected.studyYear||1) as 1|2|3) && !existingAllocation(selected.studentId, 2, (selected.studyYear||1) as 1|2|3) && (
                <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '12px 16px', fontSize: 14, color: '#92400e' }}>
                  ⏳ Application approved but <strong>no modules allocated yet</strong>. Use the 📚 Allocate button to assign modules.
                </div>
              )}
              {[
                { title: 'Personal', rows: [['Name', `${selected.firstName} ${selected.lastName}`], [selected.nationality === 'South African' ? 'SA ID' : 'Passport', selected.nationality === 'South African' ? selected.idNumber : selected.passportNumber], ['DOB', selected.dateOfBirth], ['Gender', selected.gender], ['Nationality', selected.nationality]] },
                { title: 'Contact', rows: [['Phone', selected.phone], ['Email', selected.email], ['Address', `${selected.streetAddress}, ${selected.city}, ${selected.province}`]] },
                { title: 'Qualification & Enrolment', rows: [['Code', selected.qualificationCode], ['Name', selected.qualificationName], ['Admission For', selected.admissionFor || '—'], ['Study Year', `Year ${selected.studyYear}`]] },
                { title: 'Documents Ticked', rows: selected.docsUploaded.length > 0 ? selected.docsUploaded.map((d, i) => [`Doc ${i + 1}`, d]) : [['Status', 'No documents ticked']] },
              ].map(sec => (
                <div key={sec.title} style={{ border: '1px solid var(--rf-border)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ background: 'var(--rf-offwhite)', padding: '8px 14px', fontWeight: 700, fontSize: 13, borderBottom: '1px solid var(--rf-border)' }}>{sec.title}</div>
                  <div style={{ padding: '12px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {sec.rows.map(([k, v]) => (
                      <div key={k} style={{ fontSize: 13 }}>
                        <div style={{ color: 'var(--rf-gray)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>{k}</div>
                        <div style={{ fontWeight: 500 }}>{v || '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {selected.declineReason && <div className="alert alert-error"><span>❌</span> {selected.declineReason}</div>}
            </div>
            <div className="modal-footer">
              {selected.status === 'approved' && (
                <>
                  <button className="btn" style={{ background: '#EEF2FF', color: '#3730a3', border: '1px solid #C7D2FE' }} onClick={() => openEmailPreview(selected)}>📧 Preview Email</button>
                  <button className="btn btn-primary" onClick={() => { setSelected(null); openAllocate(selected); }}>📚 Allocate Modules</button>
                </>
              )}
              {selected.status === 'pending' && (
                <>
                  <button className="btn" style={{ background: '#EEF2FF', color: '#3730a3' }} onClick={() => openEmailPreview(selected)}>👁 Preview Email</button>
                  <button className="btn btn-danger" onClick={() => setShowDecline(true)}>✗ Decline</button>
                  <button className="btn btn-success" disabled={approvingId === selected.id} onClick={() => handleApprove(selected)}>
                    {approvingId === selected.id ? '⏳ Sending...' : '✓ Approve & Send Email'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {showDecline && selected && (
        <div className="modal-overlay" onClick={() => { setShowDecline(false); setDeclineReason(''); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Decline Application</div>
              <button className="modal-close" onClick={() => { setShowDecline(false); setDeclineReason(''); }}>×</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-warning" style={{ marginBottom: 16 }}>
                <span>⚠️</span> Declining for <strong>{selected.firstName} {selected.lastName}</strong>.
              </div>
              <div className="form-group">
                <label className="form-label">Reason <span className="required">*</span></label>
                <textarea className="form-textarea" value={declineReason} onChange={e => setDeclineReason(e.target.value)} placeholder="Reason for declining..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setShowDecline(false); setDeclineReason(''); }}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDecline} disabled={!declineReason.trim()}>Confirm Decline</button>
            </div>
          </div>
        </div>
      )}

      {/* Email Preview Modal */}
      {emailPreviewApp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,26,77,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={() => setEmailPreviewApp(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 700, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 12px 40px rgba(0,26,77,0.25)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><div style={{ fontWeight: 700, fontSize: 15 }}>📧 Approval Email Preview</div><div style={{ fontSize: 12, color: '#6b7280' }}>To: {emailPreviewApp.to}</div></div>
              <button onClick={() => setEmailPreviewApp(null)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>×</button>
            </div>
            <iframe srcDoc={emailPreviewApp.html} style={{ flex: 1, border: 'none', minHeight: 600 }} title="Email Preview" />
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 2000, background: toast.type === 'success' ? '#059669' : toast.type === 'error' ? '#dc2626' : '#3730a3', color: 'white', padding: '14px 22px', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', fontSize: 14, fontWeight: 600, maxWidth: 420, lineHeight: 1.5 }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
