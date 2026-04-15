import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { QUALIFICATIONS } from '../utils/data';
import type { Module, Application } from '../types';

type Step = 'select_student' | 'allocate';

export default function AdminAllocations() {
  const { applications, registrations, allocateModules } = useApp();

  const [step, setStep] = useState<Step>('select_student');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [semester, setSemester] = useState<1 | 2>(1);
  const [studyYear, setStudyYear] = useState<1 | 2 | 3>(1);
  const [pickedModules, setPickedModules] = useState<Module[]>([]);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);
  const [justAllocated, setJustAllocated] = useState<string | null>(null); // studentId

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Only approved students
  const approvedApps = useMemo(() =>
    applications.filter(a => a.status === 'approved' && a.applicationType !== 'returning'),
    [applications]
  );

  const filtered = useMemo(() =>
    approvedApps.filter(a => {
      const q = search.toLowerCase();
      return (
        `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
        a.studentId.toLowerCase().includes(q) ||
        a.qualificationName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q)
      );
    }),
    [approvedApps, search]
  );

  // Get existing allocations for a student
  const getStudentAllocations = (studentId: string) =>
    registrations.filter(r => r.studentId === studentId && r.status === 'allocated');

  // Qualification for selected student
  const qual = selectedApp
    ? QUALIFICATIONS.find(q => q.code === selectedApp.qualificationCode)
    : null;

  // Available modules for selected year+semester
  const availableModules = qual
    ? qual.modules.filter(m => m.year === studyYear && m.semester === semester)
    : [];

  // Already allocated for this exact year+semester
  const existingAlloc = selectedApp
    ? registrations.find(r =>
        r.studentId === selectedApp.studentId &&
        r.studyYear === studyYear &&
        r.semester === semester &&
        r.status === 'allocated'
      )
    : null;

  const toggleModule = (mod: Module) => {
    setPickedModules(prev =>
      prev.find(m => m.code === mod.code)
        ? prev.filter(m => m.code !== mod.code)
        : [...prev, mod]
    );
  };

  const selectAll = () => setPickedModules(availableModules);
  const clearAll = () => setPickedModules([]);

  const openStudent = (app: Application) => {
    setSelectedApp(app);
    // Default to their study year
    setStudyYear((app.studyYear || 1) as 1 | 2 | 3);
    setSemester(1);
    setPickedModules([]);
    setStep('allocate');
  };

  const handleAllocate = async () => {
    if (!selectedApp || pickedModules.length === 0) return;
    setSaving(true);
    try {
      await allocateModules(selectedApp.id, pickedModules, semester, studyYear);
      setJustAllocated(selectedApp.studentId);
      showToast(`✅ ${pickedModules.length} modules allocated to ${selectedApp.firstName} ${selectedApp.lastName}`);
      setPickedModules([]);
    } catch {
      showToast('Failed to allocate modules. Please try again.', 'error');
    }
    setSaving(false);
  };

  const backToList = () => {
    setStep('select_student');
    setSelectedApp(null);
    setPickedModules([]);
    setJustAllocated(null);
  };

  // ── STEP 1: SELECT STUDENT ──
  if (step === 'select_student') {
    return (
      <div className="main-content">
        <h1 className="section-title">ALLOCATE MODULES</h1>
        <p className="section-subtitle">Select an approved student to allocate their modules for the semester</p>

        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Approved Students', value: approvedApps.length, icon: '🎓', color: '#123f7a' },
            { label: 'Already Allocated', value: new Set(registrations.filter(r => r.status === 'allocated').map(r => r.studentId)).size, icon: '✅', color: '#059669' },
            { label: 'Awaiting Allocation', value: approvedApps.filter(a => getStudentAllocations(a.studentId).length === 0).length, icon: '⏳', color: '#d97706' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: 10, padding: '18px 20px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 28 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Search by name, student ID, qualification or email..."
            style={{ width: '100%', padding: '11px 16px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, background: 'white', boxSizing: 'border-box' }}
          />
        </div>

        {/* Student list */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎓</div>
              <div style={{ fontWeight: 600 }}>No approved students found</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Students appear here once their application is approved</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Qualification</th>
                  <th>Study Year</th>
                  <th>Allocation Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const allocs = getStudentAllocations(a.studentId);
                  const hasAlloc = allocs.length > 0;
                  return (
                    <tr key={a.id} style={{ background: justAllocated === a.studentId ? '#F0FDF4' : undefined }}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{a.firstName} {a.lastName}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{a.email}</div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#123f7a', fontWeight: 700 }}>{a.studentId}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{a.qualificationCode}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{a.qualificationName}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#123f7a' }}>Year {a.studyYear}</span>
                      </td>
                      <td>
                        {hasAlloc ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {allocs.map(r => (
                              <span key={r.id} style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: '#D1FAE5', color: '#065f46', display: 'inline-block' }}>
                                ✅ Y{r.studyYear} Sem {r.semester} · {r.modules.length} modules
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: '#FEF3C7', color: '#92400e' }}>
                            ⏳ Not yet allocated
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => openStudent(a)}
                          style={{ background: '#123f7a', color: 'white', border: 'none', padding: '8px 18px', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                          {hasAlloc ? '✏️ Edit / Add' : '📚 Allocate'}
                        </button>
                      </td>
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

  // ── STEP 2: ALLOCATE MODULES FOR SELECTED STUDENT ──
  const allStudentAllocs = selectedApp ? getStudentAllocations(selectedApp.studentId) : [];
  const totalCredits = pickedModules.reduce((s, m) => s + m.credits, 0);
  const qualDuration = qual?.duration || '';
  const maxYear = qualDuration.startsWith('1') ? 1 : qualDuration.startsWith('2') ? 2 : 3;

  return (
    <div className="main-content">
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 14 }}>
        <button onClick={backToList} style={{ background: 'none', border: 'none', color: '#123f7a', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
          ← Allocate Modules
        </button>
        <span style={{ color: '#9ca3af' }}>›</span>
        <span style={{ color: '#374151', fontWeight: 600 }}>{selectedApp?.firstName} {selectedApp?.lastName}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

        {/* LEFT: Module selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Student info banner */}
          <div style={{ background: 'linear-gradient(135deg,#001A4D,#123f7a)', color: 'white', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: 1, marginBottom: 4 }}>ALLOCATING MODULES FOR</div>
                <div style={{ fontWeight: 800, fontSize: 20 }}>{selectedApp?.firstName} {selectedApp?.lastName}</div>
                <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4, fontFamily: 'monospace' }}>{selectedApp?.studentId}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{selectedApp?.qualificationName}</div>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>{qual?.faculty}</div>
              </div>
            </div>
          </div>

          {/* Year + Semester selector */}
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#001A4D', marginBottom: 14 }}>Select Period</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Study Year</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {([1, 2, 3] as const).slice(0, maxYear).map(y => (
                    <button key={y} onClick={() => { setStudyYear(y); setPickedModules([]); }}
                      style={{ flex: 1, padding: '9px 0', borderRadius: 7, border: `2px solid ${studyYear === y ? '#123f7a' : '#e5e7eb'}`, background: studyYear === y ? '#123f7a' : 'white', color: studyYear === y ? 'white' : '#374151', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                      Year {y}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Semester</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {([1, 2] as const).map(s => (
                    <button key={s} onClick={() => { setSemester(s); setPickedModules([]); }}
                      style={{ flex: 1, padding: '9px 0', borderRadius: 7, border: `2px solid ${semester === s ? '#123f7a' : '#e5e7eb'}`, background: semester === s ? '#123f7a' : 'white', color: semester === s ? 'white' : '#374151', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                      Sem {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Existing allocation notice */}
            {existingAlloc && (
              <div style={{ marginTop: 14, background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '11px 14px', fontSize: 13, color: '#92400e', display: 'flex', gap: 8 }}>
                <span>⚠️</span>
                <div>
                  <strong>Existing allocation found</strong> for Year {studyYear}, Semester {semester} ({existingAlloc.modules.length} modules).
                  Saving a new allocation will <strong>replace</strong> the existing one.
                </div>
              </div>
            )}
          </div>

          {/* Module selection */}
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#001A4D' }}>
                  {qual?.name} — Year {studyYear}, Semester {semester}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                  {availableModules.length} modules available · {pickedModules.length} selected
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={selectAll} style={{ background: '#EEF2FF', color: '#3730a3', border: '1px solid #C7D2FE', padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  Select All
                </button>
                <button onClick={clearAll} style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  Clear
                </button>
              </div>
            </div>

            {availableModules.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: '#6b7280' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
                <div>No modules defined for Year {studyYear}, Semester {semester}</div>
              </div>
            ) : (
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {availableModules.map((m, i) => {
                  const picked = !!pickedModules.find(p => p.code === m.code);
                  return (
                    <div
                      key={m.code}
                      onClick={() => toggleModule(m)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '13px 16px', borderRadius: 8, cursor: 'pointer',
                        border: `2px solid ${picked ? '#123f7a' : '#e5e7eb'}`,
                        background: picked ? '#EEF2FF' : '#fafafa',
                        transition: 'all 0.12s',
                      }}>
                      {/* Checkbox */}
                      <div style={{
                        width: 22, height: 22, borderRadius: 5, flexShrink: 0,
                        border: `2px solid ${picked ? '#123f7a' : '#d1d5db'}`,
                        background: picked ? '#123f7a' : 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.12s',
                      }}>
                        {picked && <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>✓</span>}
                      </div>
                      {/* Number badge */}
                      <div style={{ width: 28, height: 28, background: picked ? '#123f7a' : '#e5e7eb', borderRadius: 6, color: picked ? 'white' : '#6b7280', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.12s' }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: picked ? '#001A4D' : '#374151' }}>{m.name}</div>
                        <div style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace', marginTop: 2 }}>{m.code}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: picked ? '#123f7a' : '#6b7280' }}>{m.credits}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>credits</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Summary sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 80 }}>

          {/* Allocation summary */}
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ background: '#001A4D', color: 'white', padding: '14px 18px', fontWeight: 700, fontSize: 14 }}>
              📋 Allocation Summary
            </div>
            <div style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6', fontSize: 14 }}>
                <span style={{ color: '#6b7280' }}>Period</span>
                <span style={{ fontWeight: 700, color: '#001A4D' }}>Year {studyYear}, Sem {semester}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6', fontSize: 14 }}>
                <span style={{ color: '#6b7280' }}>Modules Selected</span>
                <span style={{ fontWeight: 700, color: pickedModules.length > 0 ? '#059669' : '#9ca3af', fontSize: 18 }}>{pickedModules.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, padding: '10px 0', borderBottom: '1px solid #f3f4f6', fontSize: 14 }}>
                <span style={{ color: '#6b7280' }}>Total Credits</span>
                <span style={{ fontWeight: 700, color: '#123f7a', fontSize: 18 }}>{totalCredits}</span>
              </div>

              {/* Selected modules list */}
              {pickedModules.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                  {pickedModules.map(m => (
                    <div key={m.code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F4F6FB', borderRadius: 6, padding: '7px 10px', fontSize: 12 }}>
                      <span style={{ fontWeight: 600, color: '#001A4D', flex: 1 }}>{m.name}</span>
                      <span style={{ color: '#6b7280', fontFamily: 'monospace', marginLeft: 8, flexShrink: 0 }}>{m.credits}cr</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleAllocate}
                disabled={pickedModules.length === 0 || saving}
                style={{
                  width: '100%', padding: '13px', borderRadius: 8, border: 'none',
                  background: pickedModules.length > 0 ? '#ffc72c' : '#e5e7eb',
                  color: pickedModules.length > 0 ? '#123f7a' : '#9ca3af',
                  fontWeight: 800, fontSize: 15, cursor: pickedModules.length > 0 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s',
                }}>
                {saving ? '⏳ Saving...' : pickedModules.length === 0 ? 'Select modules above' : `✅ Allocate ${pickedModules.length} Module${pickedModules.length > 1 ? 's' : ''}`}
              </button>

              {pickedModules.length > 0 && (
                <div style={{ marginTop: 10, fontSize: 12, color: '#6b7280', textAlign: 'center', lineHeight: 1.5 }}>
                  Student will be notified immediately via their portal
                </div>
              )}
            </div>
          </div>

          {/* Existing allocations for this student */}
          {allStudentAllocs.length > 0 && (
            <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ background: '#F4F6FB', borderBottom: '1px solid #e5e7eb', padding: '12px 18px', fontWeight: 700, fontSize: 13, color: '#001A4D' }}>
                📚 Previous Allocations
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {allStudentAllocs.map(r => (
                  <div key={r.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ background: '#059669', color: 'white', padding: '6px 12px', fontSize: 12, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Year {r.studyYear}, Sem {r.semester}</span>
                      <span>{r.modules.length} modules</span>
                    </div>
                    <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {r.modules.map(m => (
                        <div key={m.code} style={{ fontSize: 12, color: '#374151', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{m.name}</span>
                          <span style={{ color: '#6b7280', fontFamily: 'monospace' }}>{m.credits}cr</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 2000,
          background: toast.type === 'success' ? '#059669' : '#dc2626',
          color: 'white', padding: '14px 22px', borderRadius: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)', fontSize: 14, fontWeight: 600,
          maxWidth: 380, lineHeight: 1.5,
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
