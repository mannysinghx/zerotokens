/**
 * EmployeeManager.jsx
 * Table of all registered employees with their current assignment.
 * Admin can assign/reassign courses and disable/delete/change password.
 */
import { useEffect, useState, useCallback } from 'react'
import { adminFetchEmployees, adminManageUser } from '../../utils/api.js'
import { FIELD_CATEGORY_MAP } from '../../data/fieldCategories.js'
import AssignmentModal from '../components/AssignmentModal.jsx'
import UserActionModal from '../components/UserActionModal.jsx'

export default function EmployeeManager({ password }) {
  const [employees,   setEmployees]   = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [search,      setSearch]      = useState('')
  const [modal,       setModal]       = useState(null)   // assign modal
  const [actionModal, setActionModal] = useState(null)   // { user, action }

  const load = useCallback(() => {
    setLoading(true)
    adminFetchEmployees(password)
      .then(d => setEmployees(d.employees || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [password])

  async function handleToggleAdmin(emp) {
    const action = emp.is_company_admin ? 'demote-admin' : 'promote-admin'
    const label  = emp.is_company_admin ? 'Remove company admin status' : 'Promote to company admin'
    if (!window.confirm(`${label} for ${emp.username}?`)) return
    try {
      await adminManageUser(password, { userId: emp.id, action })
      load()
    } catch (err) {
      alert(`Failed: ${err.message}`)
    }
  }

  useEffect(() => { load() }, [load])

  const filtered = employees.filter(e =>
    !search ||
    (e.username ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (e.email    ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (e.team     ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (e.company_name ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-100" style={{ fontFamily: 'Exo 2' }}>Employees</h1>
          <p className="text-slate-500 text-sm font-mono mt-0.5">{employees.length} registered</p>
        </div>
        <input
          type="search"
          placeholder="Search name, email, company…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-slate-100 font-mono text-sm outline-none focus:border-cyan-500 w-64"
        />
      </div>

      {loading && <p className="text-slate-500 font-mono text-sm">Loading…</p>}
      {error   && <p className="text-red-400 font-mono text-sm">Error: {error}</p>}

      {!loading && !error && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800">
                {['Employee', 'Company', 'Assigned Course', 'Role', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-slate-500 font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => {
                const cat      = emp.category_id ? FIELD_CATEGORY_MAP[emp.category_id] : null
                const disabled = emp.is_active === false
                return (
                  <tr key={emp.id} className={`border-b border-slate-800/50 transition-colors ${disabled ? 'opacity-50' : 'hover:bg-slate-800/30'}`}>
                    <td className="px-4 py-3">
                      <div className="font-mono text-slate-200 flex items-center gap-1.5">
                        {disabled && <span title="Disabled">🔒</span>}
                        {emp.is_company_admin && <span title="Company Admin">👑</span>}
                        {emp.username}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">{emp.email ?? '—'}</div>
                      {!emp.email_verified && !disabled && (
                        <span className="text-xs text-amber-500 font-mono">⏳ invite pending</span>
                      )}
                      {disabled && <span className="text-xs text-amber-400 font-mono">account disabled</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400 text-sm">
                      {emp.company_name
                        ? <span className="text-cyan-400">{emp.company_name}</span>
                        : <span className="text-slate-700">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {cat
                        ? (
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded-full border"
                            style={{ borderColor: cat.color + '44', color: cat.color, background: cat.color + '11' }}
                          >
                            {cat.emoji} {cat.name}
                          </span>
                        )
                        : <span className="text-slate-600 font-mono text-xs">Unassigned</span>
                      }
                      {emp.sub_function && (
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{emp.sub_function}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500 text-xs">
                      {emp.role || <span className="text-slate-700">—</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 text-xs">
                      {emp.created_at ? new Date(emp.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setModal(emp)}
                          title={cat ? 'Reassign course' : 'Assign course'}
                          className="text-xs px-2.5 py-1 rounded-lg bg-cyan-900/40 text-cyan-400 hover:bg-cyan-800/60 border border-cyan-800/60 font-mono transition-colors"
                        >
                          {cat ? '↻' : '+'} Course
                        </button>
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
                        <button
                          onClick={() => setActionModal({ user: emp, action: 'set-password' })}
                          title="Change password"
                          className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700 font-mono transition-colors"
                        >
                          🔑
                        </button>
                        <button
                          onClick={() => setActionModal({ user: emp, action: 'delete' })}
                          title="Delete account"
                          className="text-xs px-2.5 py-1 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-800/50 border border-red-800/50 font-mono transition-colors"
                        >
                          🗑
                        </button>
                        {/* Promote / Demote company admin */}
                        {emp.is_company_admin ? (
                          <button
                            onClick={() => handleToggleAdmin(emp)}
                            title="Demote from company admin"
                            className="text-xs px-2.5 py-1 rounded-lg bg-amber-900/30 text-amber-400 hover:bg-amber-800/50 border border-amber-800/50 font-mono transition-colors"
                          >
                            👑 Demote
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleAdmin(emp)}
                            title="Promote to company admin"
                            className="text-xs px-2.5 py-1 rounded-lg font-mono border transition-colors"
                            style={{ background: '#3b0764', borderColor: '#7c3aed55', color: '#c4b5fd' }}
                          >
                            🔑→👑 Make Admin
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-600 font-mono text-sm">
                    {search ? 'No employees match your search.' : 'No employees registered yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <AssignmentModal
          employee={modal}
          password={password}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}

      {actionModal && (
        <UserActionModal
          user={actionModal.user}
          action={actionModal.action}
          password={password}
          onClose={() => setActionModal(null)}
          onSuccess={load}
        />
      )}
    </div>
  )
}
