/**
 * EmployeeProfileModal.jsx
 * Full employee profile panel for company admins.
 *
 * Sections:
 *   1. Profile — view and edit username / email
 *   2. Course  — current assignment, reassign button
 *   3. Activity — response stats + recent 10 answers
 *   4. Access   — promote / demote company admin
 *   5. Account  — change password, disable/enable, delete (delegates to parent)
 *
 * Props:
 *   emp       — employee row from table (initial data)
 *   token     — company admin session token
 *   onClose   — close this modal
 *   onAction  — (user, action) called to open UserActionModal in parent
 *   onRefresh — called after any mutation so parent reloads the table
 */
import { useState, useEffect } from 'react'
import { FIELD_CATEGORY_MAP } from '../../data/fieldCategories.js'
import AssignmentModal from '../../admin/components/AssignmentModal.jsx'
import {
  coAdminGetEmployeeProfile,
  coAdminUpdateEmployee,
  coAdminToggleAdmin,
  coAdminAssignEmployee,
} from '../../utils/api.js'

// ── tiny helpers ──────────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 bg-slate-800/50 border-b border-slate-800">
        <h3 className="text-xs uppercase tracking-widest font-mono text-slate-400">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-slate-800/60 rounded-xl px-4 py-3 text-center">
      <div className="text-xl font-black text-slate-100 font-mono">{value ?? '—'}</div>
      <div className="text-xs text-slate-500 font-mono mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-600 font-mono">{sub}</div>}
    </div>
  )
}

const GRADE_COLOR = { A: '#34d399', B: '#60a5fa', C: '#fbbf24', D: '#fb923c', F: '#f87171' }

// ── component ─────────────────────────────────────────────────────────────────

export default function EmployeeProfileModal({ emp: initialEmp, token, onClose, onAction, onRefresh }) {
  const [profile,       setProfile]       = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [fetchError,    setFetchError]    = useState(null)

  // Edit profile fields
  const [editUsername,  setEditUsername]  = useState(initialEmp.username ?? '')
  const [editEmail,     setEditEmail]     = useState(initialEmp.email    ?? '')
  const [saving,        setSaving]        = useState(false)
  const [saveMsg,       setSaveMsg]       = useState(null)

  // Admin toggle
  const [togglingAdmin, setTogglingAdmin] = useState(false)
  const [adminMsg,      setAdminMsg]      = useState(null)
  const [isAdmin,       setIsAdmin]       = useState(initialEmp.is_company_admin ?? false)

  // Course assignment sub-modal
  const [showAssign,    setShowAssign]    = useState(false)

  // ── fetch fresh profile ────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true)
    coAdminGetEmployeeProfile(token, initialEmp.id)
      .then(data => {
        setProfile(data)
        setIsAdmin(data.user.is_company_admin ?? false)
        setEditUsername(data.user.username ?? '')
        setEditEmail(data.user.email ?? '')
      })
      .catch(err => setFetchError(err.message))
      .finally(() => setLoading(false))
  }, [token, initialEmp.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── handlers ───────────────────────────────────────────────────────────────

  async function handleSaveProfile() {
    if (!editUsername.trim() || !editEmail.trim()) return
    setSaving(true); setSaveMsg(null)
    try {
      await coAdminUpdateEmployee(token, {
        userId:   initialEmp.id,
        username: editUsername.trim(),
        email:    editEmail.trim(),
      })
      setSaveMsg({ ok: true, text: 'Profile updated.' })
      onRefresh?.()
    } catch (err) {
      setSaveMsg({ ok: false, text: err.message })
    } finally { setSaving(false) }
  }

  async function handleToggleAdmin() {
    const next = !isAdmin
    const verb = next ? 'promote to Company Admin' : 'remove admin access from'
    if (!window.confirm(`Are you sure you want to ${verb} ${profile?.user.username ?? ''}?`)) return
    setTogglingAdmin(true); setAdminMsg(null)
    try {
      await coAdminToggleAdmin(token, { userId: initialEmp.id, makeAdmin: next })
      setIsAdmin(next)
      setAdminMsg({ ok: true, text: next ? '👑 Promoted to Company Admin.' : 'Admin access removed.' })
      onRefresh?.()
    } catch (err) {
      setAdminMsg({ ok: false, text: err.message })
    } finally { setTogglingAdmin(false) }
  }

  async function handleAssign(params) {
    await coAdminAssignEmployee(token, params)
  }

  function triggerAction(action) {
    onClose()
    onAction?.(profile?.user ?? initialEmp, action)
  }

  // ── helpers ────────────────────────────────────────────────────────────────

  const user       = profile?.user       ?? initialEmp
  const assignment = profile?.assignment ?? null
  const stats      = profile?.stats      ?? {}
  const recent     = profile?.recent_responses ?? []
  const cat        = assignment?.category_id ? FIELD_CATEGORY_MAP[assignment.category_id] : null
  const disabled   = user.is_active === false
  const pctCorrect = stats.total_answered > 0
    ? Math.round((stats.total_correct / stats.total_answered) * 100)
    : null

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="fixed inset-0 bg-black/75 flex items-start justify-center z-50 px-4 py-8 overflow-y-auto">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl my-auto">

          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between p-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-100">{user.username}</h2>
                {isAdmin && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-violet-900/40 text-violet-300 border border-violet-700/50">👑 Admin</span>
                )}
                {disabled && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-red-900/30 text-red-400 border border-red-800/50">Disabled</span>
                )}
                {!user.email_verified && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-900/30 text-amber-400 border border-amber-800/50">⏳ Pending</span>
                )}
              </div>
              <p className="text-sm text-slate-500 font-mono mt-0.5">{user.email}</p>
              <p className="text-xs text-slate-600 font-mono mt-0.5">
                Member since {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
              </p>
            </div>
            <button onClick={onClose} className="text-slate-600 hover:text-slate-300 text-xl leading-none ml-4">✕</button>
          </div>

          {loading && (
            <div className="p-8 text-center text-slate-500 font-mono text-sm">Loading profile…</div>
          )}
          {fetchError && (
            <div className="p-8 text-center text-red-400 font-mono text-sm">⚠ {fetchError}</div>
          )}

          {!loading && !fetchError && (
            <div className="p-6 space-y-5">

              {/* ── 1. Edit Profile ───────────────────────────────────────── */}
              <Section title="Profile">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-slate-500 font-mono mb-1.5">Username</label>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={e => setEditUsername(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-purple-500 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-slate-500 font-mono mb-1.5">Email</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={e => setEditEmail(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-purple-500 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving || !editUsername.trim() || !editEmail.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    style={{ background: 'linear-gradient(90deg, #7c3aed, #a855f7)' }}
                  >
                    {saving ? 'Saving…' : '💾 Save Changes'}
                  </button>
                  {saveMsg && (
                    <span className={`text-xs font-mono ${saveMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                      {saveMsg.text}
                    </span>
                  )}
                </div>
              </Section>

              {/* ── 2. Course Assignment ──────────────────────────────────── */}
              <Section title="Course Assignment">
                {cat ? (
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <span
                        className="inline-flex items-center gap-1.5 text-sm font-mono px-3 py-1 rounded-full border"
                        style={{ borderColor: cat.color + '44', color: cat.color, background: cat.color + '11' }}
                      >
                        {cat.emoji} {cat.name}
                      </span>
                      {assignment.sub_function && (
                        <p className="text-xs text-slate-500 font-mono mt-1.5">
                          Sub-function: <span className="text-slate-300">{assignment.sub_function}</span>
                        </p>
                      )}
                      {assignment.role && (
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          Role: <span className="text-slate-300">{assignment.role}</span>
                        </p>
                      )}
                      {assignment.assigned_at && (
                        <p className="text-xs text-slate-600 font-mono mt-0.5">
                          Assigned {new Date(assignment.assigned_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setShowAssign(true)}
                      className="text-xs px-3 py-1.5 rounded-lg font-mono border transition-colors"
                      style={{ background: '#1e3a5f', borderColor: '#0284c744', color: '#38bdf8' }}
                    >
                      ↻ Reassign Course
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <p className="text-slate-600 font-mono text-sm">No course assigned yet.</p>
                    <button
                      onClick={() => setShowAssign(true)}
                      className="text-xs px-3 py-1.5 rounded-lg font-mono border transition-colors"
                      style={{ background: '#1e3a5f', borderColor: '#0284c744', color: '#38bdf8' }}
                    >
                      📚 Assign Course
                    </button>
                  </div>
                )}
              </Section>

              {/* ── 3. Activity Stats ─────────────────────────────────────── */}
              <Section title="Training Activity">
                {stats.total_answered === 0 ? (
                  <p className="text-slate-600 font-mono text-sm">No training activity yet.</p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <StatCard label="Questions" value={stats.total_answered} />
                      <StatCard label="Correct" value={pctCorrect != null ? `${pctCorrect}%` : '—'} sub={`${stats.total_correct} of ${stats.total_answered}`} />
                      <StatCard label="Avg Score" value={stats.avg_score != null ? `${stats.avg_score}` : '—'} />
                      <StatCard label="Tokens Saved" value={stats.avg_tokens_saved != null ? `${stats.avg_tokens_saved}` : '—'} sub="avg per question" />
                    </div>

                    {/* Grade distribution */}
                    {Object.keys(stats.grades ?? {}).length > 0 && (
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <span className="text-xs text-slate-500 font-mono">Grades:</span>
                        {['A', 'B', 'C', 'D', 'F'].map(g =>
                          stats.grades[g] ? (
                            <span key={g} className="text-xs font-mono px-2 py-0.5 rounded-full border"
                              style={{ color: GRADE_COLOR[g], borderColor: GRADE_COLOR[g] + '44', background: GRADE_COLOR[g] + '11' }}>
                              {g}: {stats.grades[g]}
                            </span>
                          ) : null
                        )}
                        {stats.last_active && (
                          <span className="text-xs text-slate-600 font-mono ml-auto">
                            Last active {new Date(stats.last_active).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Recent responses */}
                    {recent.length > 0 && (
                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-xs font-mono min-w-[420px]">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-500">
                              <th className="text-left px-3 py-2">Question</th>
                              <th className="text-center px-3 py-2">Grade</th>
                              <th className="text-center px-3 py-2">Score</th>
                              <th className="text-center px-3 py-2">Correct</th>
                              <th className="text-right px-3 py-2">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recent.map((r, i) => (
                              <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                                <td className="px-3 py-2 text-slate-400 max-w-[180px] truncate">
                                  {r.question_title ?? '—'}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {r.grade && (
                                    <span style={{ color: GRADE_COLOR[r.grade] ?? '#94a3b8' }}>{r.grade}</span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-center text-slate-400">{r.total_score ?? '—'}</td>
                                <td className="px-3 py-2 text-center">
                                  {r.is_correct
                                    ? <span className="text-emerald-400">✓</span>
                                    : <span className="text-red-400">✗</span>}
                                </td>
                                <td className="px-3 py-2 text-right text-slate-600">
                                  {r.answered_at ? new Date(r.answered_at).toLocaleDateString() : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </Section>

              {/* ── 4. Admin Access ───────────────────────────────────────── */}
              <Section title="Admin Access">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    {isAdmin ? (
                      <p className="text-sm font-mono text-violet-300">
                        👑 <strong>{user.username}</strong> has Company Admin access.
                      </p>
                    ) : (
                      <p className="text-sm font-mono text-slate-400">
                        This employee does not have Company Admin access.
                      </p>
                    )}
                    <p className="text-xs text-slate-600 font-mono mt-1">
                      Company admins can manage all employees in your company.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleAdmin}
                    disabled={togglingAdmin}
                    className="text-xs px-3 py-1.5 rounded-lg font-mono border transition-colors disabled:opacity-40"
                    style={isAdmin
                      ? { background: '#92400e22', borderColor: '#d9770644', color: '#fbbf24' }
                      : { background: '#3b0764cc', borderColor: '#7c3aed', color: '#e9d5ff' }}
                  >
                    {togglingAdmin
                      ? '…'
                      : isAdmin ? '👤 Remove Admin' : '👑 Make Admin'}
                  </button>
                </div>
                {adminMsg && (
                  <p className={`mt-2 text-xs font-mono ${adminMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                    {adminMsg.text}
                  </p>
                )}
              </Section>

              {/* ── 5. Account Actions ────────────────────────────────────── */}
              <Section title="Account Management">
                <div className="flex flex-wrap gap-2">
                  {/* Change password */}
                  <button
                    onClick={() => triggerAction('set-password')}
                    className="text-xs px-3 py-2 rounded-lg font-mono border bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700 transition-colors"
                  >
                    🔑 Change Password
                  </button>

                  {/* Disable / Enable */}
                  <button
                    onClick={() => triggerAction(disabled ? 'enable' : 'disable')}
                    className={`text-xs px-3 py-2 rounded-lg font-mono border transition-colors ${
                      disabled
                        ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50 hover:bg-emerald-800/50'
                        : 'bg-amber-900/30 text-amber-400 border-amber-800/50 hover:bg-amber-800/50'
                    }`}
                  >
                    {disabled ? '✅ Enable Account' : '🔒 Disable Account'}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => triggerAction('delete')}
                    className="text-xs px-3 py-2 rounded-lg font-mono border bg-red-900/20 text-red-400 hover:bg-red-900/40 border-red-800/50 transition-colors"
                  >
                    🗑 Delete Account
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-700 font-mono">
                  Password changes and deletions take effect immediately.
                </p>
              </Section>

            </div>
          )}

          {/* Footer close */}
          <div className="px-6 pb-6">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm font-mono text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Course assignment sub-modal */}
      {showAssign && (
        <AssignmentModal
          employee={profile?.user ?? initialEmp}
          password={null}
          onAssign={handleAssign}
          onClose={() => setShowAssign(false)}
          onSaved={() => {
            setShowAssign(false)
            // Re-fetch profile to reflect new assignment
            coAdminGetEmployeeProfile(token, initialEmp.id)
              .then(data => setProfile(data))
              .catch(() => {})
            onRefresh?.()
          }}
        />
      )}
    </>
  )
}
