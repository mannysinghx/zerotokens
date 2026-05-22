/**
 * IndividualUsers.jsx
 * Table of all self-registered individual learners (user_type = 'individual').
 * Admin can disable/enable, delete, or change passwords.
 */
import { useEffect, useState, useCallback } from 'react'
import { adminFetchIndividuals } from '../../utils/api.js'
import UserActionModal from '../components/UserActionModal.jsx'

export default function IndividualUsers({ password }) {
  const [users,       setUsers]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [search,      setSearch]      = useState('')
  const [actionModal, setActionModal] = useState(null)   // { user, action }

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
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-800">
                {['User', 'Status', 'Responses', 'Last Active', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-slate-500 font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const disabled = u.is_active === false
                return (
                  <tr key={u.id} className={`border-b border-slate-800/50 transition-colors ${disabled ? 'opacity-50' : 'hover:bg-slate-800/20'}`}>
                    <td className="px-4 py-3">
                      <div className="font-mono text-slate-200 flex items-center gap-1.5">
                        {disabled && <span title="Disabled">🔒</span>}
                        {u.username}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      {disabled ? (
                        <span className="text-xs font-mono text-amber-400 bg-amber-900/30 border border-amber-800/50 px-2 py-0.5 rounded-full">🔒 Disabled</span>
                      ) : u.email_verified ? (
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-900/30 border border-emerald-800/50 px-2 py-0.5 rounded-full">✓ Verified</span>
                      ) : (
                        <span className="text-xs font-mono text-amber-400 bg-amber-900/30 border border-amber-800/50 px-2 py-0.5 rounded-full">⏳ Pending</span>
                      )}
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setActionModal({ user: u, action: disabled ? 'enable' : 'disable' })}
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
                          onClick={() => setActionModal({ user: u, action: 'set-password' })}
                          title="Change password"
                          className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700 font-mono transition-colors"
                        >
                          🔑
                        </button>
                        <button
                          onClick={() => setActionModal({ user: u, action: 'delete' })}
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
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-600 font-mono text-sm">
                    {search ? 'No users match your search.' : 'No individual users registered yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
