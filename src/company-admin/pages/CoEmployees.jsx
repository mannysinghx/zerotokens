/**
 * CoEmployees.jsx
 * Full employee management for the company admin:
 *   - View employees with assigned course
 *   - Invite new employees (email)
 *   - Resend invitation email for pending employees
 *   - Assign / reassign courses (Category → Sub-function → Role)
 *   - Disable / enable accounts
 *   - Change password
 *   - Delete accounts
 */
import { useEffect, useState, useCallback } from 'react'
import {
  coAdminFetchEmployees,
  coAdminInviteEmployee,
  coAdminManageUser,
  coAdminAssignEmployee,
  coAdminResendInvite,
} from '../../utils/api.js'
import { FIELD_CATEGORY_MAP } from '../../data/fieldCategories.js'
import AssignmentModal from '../../admin/components/AssignmentModal.jsx'
import UserActionModal from '../../admin/components/UserActionModal.jsx'

// ── helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ emp }) {
  if (emp.is_active === false)
    return <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-red-900/30 text-red-400 border border-red-800/50">Disabled</span>
  if (!emp.email_verified)
    return <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-900/30 text-amber-400 border border-amber-800/50">⏳ Pending</span>
  return <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-900/30 text-emerald-400 border border-emerald-800/50">Verified</span>
}

function CourseBadge({ emp }) {
  const cat = emp.category_id ? FIELD_CATEGORY_MAP[emp.category_id] : null
  if (!cat) return <span className="text-slate-600 font-mono text-xs">Unassigned</span>
  return (
    <div>
      <span
        className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full border"
        style={{ borderColor: cat.color + '44', color: cat.color, background: cat.color + '11' }}
      >
        {cat.emoji} {cat.name}
      </span>
      {emp.sub_function && (
        <div className="text-xs text-slate-500 font-mono mt-0.5">{emp.sub_function}</div>
      )}
    </div>
  )
}

// ── component ─────────────────────────────────────────────────────────────────

export default function CoEmployees({ token, adminUser }) {
  const [employees,    setEmployees]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [search,       setSearch]       = useState('')
  const [showInvite,   setShowInvite]   = useState(false)
  const [assignModal,  setAssignModal]  = useState(null)   // employee object
  const [actionModal,  setActionModal]  = useState(null)   // { user, action }
  const [resending,    setResending]    = useState(null)   // userId being resent
  const [resendMsg,    setResendMsg]    = useState(null)   // { ok, text, userId }

  // Invite form
  const [invEmail,     setInvEmail]     = useState('')
  const [invUsername,  setInvUsername]  = useState('')
  const [inviting,     setInviting]     = useState(false)
  const [inviteMsg,    setInviteMsg]    = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    coAdminFetchEmployees(token)
      .then(d => setEmployees(d.employees || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => { load() }, [load])

  const filtered = employees.filter(e =>
    !search ||
    (e.username ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (e.email    ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  // ── handlers ────────────────────────────────────────────────────────────────

  async function handleInvite(e) {
    e.preventDefault()
    if (!invEmail.trim() || !invUsername.trim()) return
    setInviting(true); setInviteMsg(null)
    try {
      await coAdminInviteEmployee(token, { email: invEmail.trim(), username: invUsername.trim() })
      setInviteMsg({ ok: true, text: `Invitation sent to ${invEmail.trim()}` })
      setInvEmail(''); setInvUsername('')
      load()
    } catch (err) {
      setInviteMsg({ ok: false, text: err.message })
    } finally { setInviting(false) }
  }

  async function handleResendInvite(emp) {
    setResending(emp.id); setResendMsg(null)
    try {
      const data = await coAdminResendInvite(token, { userId: emp.id })
      setResendMsg({ ok: true, text: data.message, userId: emp.id })
    } catch (err) {
      setResendMsg({ ok: false, text: err.message, userId: emp.id })
    } finally { setResending(null) }
  }

  async function handleUserAction({ userId, action, newPassword }) {
    await coAdminManageUser(token, { userId, action, newPassword })
  }

  async function handleAssign({ userId, categoryId, subFunction, role }) {
    await coAdminAssignEmployee(token, { userId, categoryId, subFunction, role })
  }

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-100" style={{ fontFamily: 'Exo 2' }}>Employees</h1>
          <p className="text-slate-500 text-sm font-mono mt-0.5">
            {employees.length} in {adminUser?.company_name ?? 'your company'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="search"
            placeholder="Search name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-slate-100 font-mono text-sm outline-none focus:border-purple-500 w-56"
          />
          <button
            onClick={() => { setShowInvite(v => !v); setInviteMsg(null) }}
            className="text-sm font-mono px-4 py-2 rounded-xl border transition-colors"
            style={{
              background: showInvite ? '#581c87' : '#3b0764',
              borderColor: '#7c3aed',
              color: '#e9d5ff',
            }}
          >
            {showInvite ? '✕ Close' : '➕ Invite Employee'}
          </button>
        </div>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="bg-slate-900 border rounded-xl p-5 mb-5" style={{ borderColor: '#7c3aed55' }}>
          <h2 className="text-sm font-mono font-bold mb-4" style={{ color: '#a855f7' }}>Invite New Employee</h2>
          <form onSubmit={handleInvite} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs uppercase tracking-widest font-mono mb-1" style={{ color: '#a855f7' }}>Email</label>
              <input type="email" value={invEmail} onChange={e => setInvEmail(e.target.value)}
                placeholder="employee@company.com" required
                className="w-full bg-slate-800 border border-slate-700 focus:border-purple-500 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm outline-none transition-colors" />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs uppercase tracking-widest font-mono mb-1" style={{ color: '#a855f7' }}>Username</label>
              <input type="text" value={invUsername} onChange={e => setInvUsername(e.target.value)}
                placeholder="jsmith" required
                className="w-full bg-slate-800 border border-slate-700 focus:border-purple-500 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm outline-none transition-colors" />
            </div>
            <button type="submit" disabled={inviting || !invEmail.trim() || !invUsername.trim()}
              className="px-5 py-2 rounded-xl text-sm font-mono font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              style={{ background: 'linear-gradient(90deg, #7c3aed, #a855f7)' }}>
              {inviting ? 'Sending…' : '📧 Send Invite'}
            </button>
          </form>
          {inviteMsg && (
            <p className={`mt-3 text-xs font-mono ${inviteMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>
              {inviteMsg.ok ? '✓' : '⚠'} {inviteMsg.text}
            </p>
          )}
        </div>
      )}

      {loading && <p className="text-slate-500 font-mono text-sm">Loading…</p>}
      {error   && <p className="text-red-400 font-mono text-sm">Error: {error}</p>}

      {!loading && !error && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-800">
                {['Employee', 'Status', 'Assigned Course', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-slate-500 font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => {
                const disabled = emp.is_active === false
                const isPending = !emp.email_verified
                const isResendingThis = resending === emp.id
                const thisResendMsg = resendMsg?.userId === emp.id ? resendMsg : null

                return (
                  <tr key={emp.id}
                    className={`border-b border-slate-800/50 transition-colors ${disabled ? 'opacity-50' : 'hover:bg-slate-800/30'}`}>

                    {/* Employee */}
                    <td className="px-4 py-3">
                      <div className="font-mono text-slate-200 flex items-center gap-1.5">
                        {disabled && <span title="Disabled">🔒</span>}
                        {emp.is_company_admin && <span title="Company Admin">👑</span>}
                        {emp.username}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">{emp.email ?? '—'}</div>
                      {/* Resend feedback inline */}
                      {thisResendMsg && (
                        <p className={`text-xs font-mono mt-0.5 ${thisResendMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                          {thisResendMsg.ok ? '✓' : '⚠'} {thisResendMsg.text}
                        </p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3"><StatusBadge emp={emp} /></td>

                    {/* Assigned Course */}
                    <td className="px-4 py-3"><CourseBadge emp={emp} /></td>

                    {/* Joined */}
                    <td className="px-4 py-3 font-mono text-slate-600 text-xs">
                      {emp.created_at ? new Date(emp.created_at).toLocaleDateString() : '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">

                        {/* Assign / Reassign course */}
                        <button
                          onClick={() => setAssignModal(emp)}
                          title={emp.category_id ? 'Reassign course' : 'Assign course'}
                          className="text-xs px-2.5 py-1 rounded-lg font-mono border transition-colors"
                          style={{ background: '#1e3a5f', borderColor: '#0284c744', color: '#38bdf8' }}
                        >
                          {emp.category_id ? '↻ Course' : '📚 Assign'}
                        </button>

                        {/* Resend invite — only for pending employees */}
                        {isPending && !disabled && (
                          <button
                            onClick={() => handleResendInvite(emp)}
                            disabled={isResendingThis}
                            title="Resend invitation email"
                            className="text-xs px-2.5 py-1 rounded-lg font-mono border transition-colors bg-violet-900/40 text-violet-400 hover:bg-violet-800/60 border-violet-800/60 disabled:opacity-40"
                          >
                            {isResendingThis ? '…' : '📧 Resend'}
                          </button>
                        )}

                        {/* Disable / Enable */}
                        <button
                          onClick={() => setActionModal({ user: emp, action: disabled ? 'enable' : 'disable' })}
                          title={disabled ? 'Enable account' : 'Disable account'}
                          className={`text-xs px-2.5 py-1 rounded-lg font-mono border transition-colors ${
                            disabled
                              ? 'bg-emerald-900/40 text-emerald-400 hover:bg-emerald-800/60 border-emerald-800/60'
                              : 'bg-amber-900/40 text-amber-400 hover:bg-amber-800/60 border-amber-800/60'
                          }`}
                        >
                          {disabled ? '✅' : '🔒'}
                        </button>

                        {/* Change password */}
                        <button
                          onClick={() => setActionModal({ user: emp, action: 'set-password' })}
                          title="Change password"
                          className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700 font-mono transition-colors"
                        >
                          🔑
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setActionModal({ user: emp, action: 'delete' })}
                          title="Delete account"
                          className="text-xs px-2.5 py-1 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-800/50 border border-red-800/50 font-mono transition-colors"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-600 font-mono text-sm">
                    {search ? 'No employees match your search.' : 'No employees yet — invite some above!'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Course assignment modal */}
      {assignModal && (
        <AssignmentModal
          employee={assignModal}
          password={null}
          onAssign={handleAssign}
          onClose={() => setAssignModal(null)}
          onSaved={load}
        />
      )}

      {/* User action modal (disable/enable/delete/set-password) */}
      {actionModal && (
        <UserActionModal
          user={actionModal.user}
          action={actionModal.action}
          password={null}
          onConfirmAction={handleUserAction}
          onClose={() => setActionModal(null)}
          onSuccess={load}
        />
      )}
    </div>
  )
}
