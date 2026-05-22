/**
 * CoDashboard.jsx
 * Company admin dashboard — shows stats about the company's employees.
 * Violet accent, dark theme.
 */
import { useEffect, useState } from 'react'
import { coAdminFetchEmployees } from '../../utils/api.js'

function StatCard({ icon, label, value, color = '#a855f7' }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <div className="text-2xl font-black font-mono" style={{ color }}>{value ?? '—'}</div>
        <div className="text-xs text-slate-500 font-mono mt-0.5">{label}</div>
      </div>
    </div>
  )
}

export default function CoDashboard({ token, adminUser }) {
  const [employees, setEmployees] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    coAdminFetchEmployees(token)
      .then(d => setEmployees(d.employees || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  const total    = employees.length
  const verified = employees.filter(e => e.email_verified).length
  const active   = employees.filter(e => e.is_active !== false).length
  const pending  = employees.filter(e => !e.email_verified && e.is_active !== false).length

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-100 mb-0.5" style={{ fontFamily: 'Exo 2' }}>
          Welcome back, {adminUser?.username ?? 'Admin'}
        </h1>
        <p className="text-slate-500 text-sm font-mono">
          <span style={{ color: '#a855f7' }}>{adminUser?.company_name ?? 'Your company'}</span>
          {' '}· Company Admin Portal
        </p>
      </div>

      {loading && <p className="text-slate-500 font-mono text-sm">Loading stats…</p>}
      {error   && <p className="text-red-400 font-mono text-sm">Error: {error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="👥" label="Total Employees"    value={total}    color="#a855f7" />
          <StatCard icon="✅" label="Verified Accounts"  value={verified} color="#10b981" />
          <StatCard icon="🟢" label="Active Accounts"    value={active}   color="#00d4ff" />
          <StatCard icon="⏳" label="Pending Invites"    value={pending}  color="#f59e0b" />
        </div>
      )}

      {!loading && !error && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-xs uppercase tracking-widest font-mono mb-3" style={{ color: '#a855f7' }}>
            Quick Overview
          </h2>
          <div className="space-y-2 text-sm font-mono text-slate-400">
            <p>
              <span className="text-slate-600">Company: </span>
              <span className="text-slate-200">{adminUser?.company_name}</span>
            </p>
            <p>
              <span className="text-slate-600">Your role: </span>
              <span style={{ color: '#a855f7' }}>Company Admin</span>
            </p>
            <p>
              <span className="text-slate-600">Employees: </span>
              <span className="text-slate-200">{total} registered</span>
              {pending > 0 && (
                <span className="text-amber-400 ml-2">({pending} pending verification)</span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
