/**
 * EmployeeManager.jsx
 * Table of all registered employees with their current assignment.
 * Admin can assign/reassign courses.
 */
import { useEffect, useState, useCallback } from 'react'
import { adminFetchEmployees } from '../../utils/api.js'
import { FIELD_CATEGORY_MAP } from '../../data/fieldCategories.js'
import AssignmentModal from '../components/AssignmentModal.jsx'

export default function EmployeeManager({ password }) {
  const [employees, setEmployees] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [search,    setSearch]    = useState('')
  const [modal,     setModal]     = useState(null)   // employee to assign

  const load = useCallback(() => {
    setLoading(true)
    adminFetchEmployees(password)
      .then(d => setEmployees(d.employees || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [password])

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
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {['Employee', 'Company / Type', 'Assigned Course', 'Role', 'Joined', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-slate-500 font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => {
                const cat = emp.category_id ? FIELD_CATEGORY_MAP[emp.category_id] : null
                return (
                  <tr key={emp.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono text-slate-200">{emp.username}</div>
                      <div className="text-xs text-slate-500 font-mono">{emp.email ?? '—'}</div>
                      {!emp.email_verified && (
                        <span className="text-xs text-amber-500 font-mono">⏳ invite pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400 text-sm">
                      {emp.company_name
                        ? <span className="text-cyan-400">{emp.company_name}</span>
                        : <span className="text-slate-700">—</span>}
                      {' '}
                      <span className="text-xs text-slate-600">
                        ({emp.user_type === 'company' ? '🏢' : '🎮'})
                      </span>
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
                      <button
                        onClick={() => setModal(emp)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-cyan-900/40 text-cyan-400 hover:bg-cyan-800/60 border border-cyan-800/60 font-mono transition-colors"
                      >
                        {cat ? 'Reassign' : 'Assign'}
                      </button>
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
    </div>
  )
}
