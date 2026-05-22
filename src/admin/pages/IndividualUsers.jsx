/**
 * IndividualUsers.jsx
 * Table of all self-registered individual learners (user_type = 'individual').
 * Completely separate from company employees.
 */
import { useEffect, useState, useCallback } from 'react'
import { adminFetchIndividuals } from '../../utils/api.js'

export default function IndividualUsers({ password }) {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [search,  setSearch]  = useState('')

  const load = useCallback(() => {
    setLoading(true)
    adminFetchIndividuals(password)
      .then(d => setUsers(d.individuals || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [password])

  useEffect(() => { load() }, [load])

  const filtered = users.filter(u =>
    !search ||
    (u.username ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email    ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-100" style={{ fontFamily: 'Exo 2' }}>
            Individual Users
          </h1>
          <p className="text-slate-500 text-sm font-mono mt-0.5">
            {users.length} self-registered learner{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <input
          type="search"
          placeholder="Search name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-slate-100 font-mono text-sm outline-none focus:border-cyan-500 w-64"
        />
      </div>

      {loading && <p className="text-slate-500 font-mono text-sm">Loading…</p>}
      {error   && <p className="text-red-400 font-mono text-sm">Error: {error}</p>}

      {!loading && !error && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-800">
                {['User', 'Status', 'Responses', 'Last Active', 'Joined'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-slate-500 font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono text-slate-200">{u.username}</div>
                    <div className="text-xs text-slate-500 font-mono">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    {u.email_verified
                      ? <span className="text-xs font-mono text-emerald-400 bg-emerald-900/30 border border-emerald-800/50 px-2 py-0.5 rounded-full">✓ Verified</span>
                      : <span className="text-xs font-mono text-amber-400 bg-amber-900/30 border border-amber-800/50 px-2 py-0.5 rounded-full">⏳ Pending</span>
                    }
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400 text-sm">
                    {u.response_count > 0
                      ? <span className="text-cyan-400">{u.response_count}</span>
                      : <span className="text-slate-700">0</span>
                    }
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-500 text-xs">
                    {u.last_active ? new Date(u.last_active).toLocaleDateString() : <span className="text-slate-700">—</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600 text-xs">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-600 font-mono text-sm">
                    {search ? 'No users match your search.' : 'No individual users registered yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
