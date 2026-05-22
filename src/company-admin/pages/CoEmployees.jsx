/**
 * CoEmployees.jsx
 * Full employee management for the company admin:
 *   - View employees with status, assigned course, admin badge
 *   - Add new employees (username + email + password → auto-verified email flow)
 *   - Resend verification email for pending employees
 *   - Assign / reassign courses (Category → Sub-function → Role)
 *   - Promote / demote company admin
 *   - View full employee profile (edit name/email, stats, certs)
 *   - Disable / enable / change password / delete accounts
 */
import { useEffect, useState, useCallback } from 'react'
import {
  coAdminFetchEmployees,
  coAdminManageUser,
  coAdminAssignEmployee,
  coAdminResendInvite,
  coAdminToggleAdmin,
} from '../../utils/api.js'
import { FIELD_CATEGORY_MAP } from '../../data/fieldCategories.js'
import AssignmentModal      from '../../admin/components/AssignmentModal.jsx'
import UserActionModal      from '../../admin/components/UserActionModal.jsx'
import AddEmployeeModal     from '../components/AddEmployeeModal.jsx'
import EmployeeProfileModal from '../components/EmployeeProfileModal.jsx'

// ── helpers ───────────────────────────────────────────────────────────────────

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

  // Modals
  const [showAdd,      setShowAdd]      = useState(false)       // AddEmployeeModal
  const [profileModal, setProfileModal] = useState(null)        // employee object
  const [assignModal,  setAssignModal]  = useState(null)        // employee object
  const [actionModal,  setActionModal]  = useState(null)        // { user, action }

  // Resend invite
  const [resending,    setResending]    = useState(null)        // userId
  const [resendMsg,    setResendMsg]    = useState(null)        // { ok, text, userId }

  // Admin toggle
  const [togglingAdmin, setTogglingAdmin] = useState(null)      // userId
  const [adminToggleMsg, setAdminToggleMsg] = useState(null)    // { ok, text, userId }

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

  async function handleToggleAdmin(emp) {
    const next = !emp.is_company_admin
    const verb = next ? `promote ${emp.username} to Company Admin` : `remove admin access from ${emp.username}`
    if (!window.confirm(`Are you sure you want to ${verb}?`)) return
    setTogglingAdmin(emp.id); setAdminToggleMsg(null)
    try {
      await coAdminToggleAdmin(token, { userId: emp.id, makeAdmin: next })
      setAdminToggleMsg({ ok: true, text: next ? `👑 ${emp.username} is now a Company Admin.` : `Admin access removed.`, userId: emp.id })
      load()
    } catch (err) {
      setAdminToggleMsg({ ok: false, text: err.message, userId: emp.id })
    } finally { setTogglingAdmin(null) }
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
            onClick={() => setShowAdd(true)}
            className="text-sm font-mono px-4 py-2 rounded-xl border transition-colors"
            style={{ background: '#3b0764', borderColor: '#7c3aed', color: '#e9d5ff' }}
          >
            ➕ Add Employee
          </button>
        </div>
      </div>

      {loading && <p className="text-slate-500 font-mono text-sm">Loading…</p>}
      {error   && <p className="text-red-400 font-mono text-sm">Error: {error}</p>}

      {!loading && !error && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="border-b border-slate-800">
                {['Employee', 'Status', 'Assigned Course', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-slate-500 font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => {
                const disabled          = emp.is_active === false
                const isPending         = !emp.email_verified
                const isResendingThis   = resending === emp.id
                const thisResendMsg     = resendMsg?.userId === emp.id ? resendMsg : null
                const isTogglingThis    = togglingAdmin === emp.id
                const thisAdminMsg      = adminToggleMsg?.userId === emp.id ? adminToggleMsg : null

                return (
                  <tr key={emp.id}
                    className={`border-b border-slate-800/50 transition-colors ${disabled ? 'opacity-50' : 'hover:bg-slate-800/20'}`}>

                    {/* Employee */}
                    <td className="px-4 py-3">
                      <div className="font-mono text-slate-200 flex items-center gap-1.5">
                        {disabled && <span title="Disabled">🔒</span>}
                        {emp.is_company_admin && <span title="Company Admin">👑</span>}
                        {emp.username}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">{emp.email ?? '—'}</div>
                      {thisResendMsg && (
                        <p className={`text-xs font-mono mt-0.5 ${thisResendMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                          {thisResendMsg.ok ? '✓' : '⚠'} {thisResendMsg.text}
                        </p>
                      )}
                      {thisAdminMsg && (
                        <p className={`text-xs font-mono mt-0.5 ${thisAdminMsg.ok ? 'text-violet-400' : 'text-red-400'}`}>
                          {thisAdminMsg.text}
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

                        {/* View profile */}
                        <button
                          onClick={() => setProfileModal(emp)}
                          title="View full profile"
                          className="text-xs px-2.5 py-1 rounded-lg font-mono border transition-colors bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700"
                        >
                          👁 Profile
                        </button>

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

                        {/* Toggle admin */}
                        <button
                          onClick={() => handleToggleAdmin(emp)}
                          disabled={isTogglingThis}
                          title={emp.is_company_admin ? 'Remove admin access' : 'Make Company Admin'}
                          className={`text-xs px-2.5 py-1 rounded-lg font-mono border transition-colors disabled:opacity-40 ${
                            emp.is_company_admin
                              ? 'bg-amber-900/30 text-amber-400 hover:bg-amber-800/50 border-amber-800/50'
                              : 'bg-violet-900/20 text-violet-400 hover:bg-violet-900/40 border-violet-800/40'
                          }`}
                        >
                          {isTogglingThis ? '…' : emp.is_company_admin ? '👤 Demote' : '👑'}
                        </button>

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
                    {search ? 'No employees match your search.' : 'No employees yet — add one above!'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add employee modal */}
      {showAdd && (
        <AddEmployeeModal
          token={token}
          onClose={() => setShowAdd(false)}
          onCreated={load}
        />
      )}

      {/* Employee profile modal */}
      {profileModal && (
        <EmployeeProfileModal
          emp={profileModal}
          token={token}
          onClose={() => setProfileModal(null)}
          onAction={(user, action) => setActionModal({ user, action })}
          onRefresh={load}
        />
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
