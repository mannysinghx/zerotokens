/**
 * AdminDashboard.jsx
 * Overview cards: total employees, active assignments, responses today, avg score.
 * Plus per-category breakdown table.
 */
import { useEffect, useState } from 'react'
import { adminFetchStats } from '../../utils/api.js'

function StatCard({ icon, label, value, color = '#00d4ff' }) {
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

export default function AdminDashboard({ password }) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    adminFetchStats(password)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [password])

  if (loading) return <p className="text-slate-500 font-mono text-sm">Loading stats…</p>
  if (error)   return <p className="text-red-400 font-mono text-sm">Error: {error}</p>

  const { totals, responsesToday, categoryStats } = data

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-100 mb-1" style={{ fontFamily: 'Exo 2' }}>
        Dashboard
      </h1>
      <p className="text-slate-500 text-sm font-mono mb-6">Live overview of your corporate training programme.</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="👥" label="Total Employees"    value={totals.total_employees}    color="#00d4ff" />
        <StatCard icon="🎯" label="Active Assignments" value={totals.active_assignments}  color="#a855f7" />
        <StatCard icon="📋" label="Responses Today"    value={responsesToday}            color="#f59e0b" />
        <StatCard icon="📈" label="Overall Avg Score"  value={totals.avg_score ? `${totals.avg_score}%` : '—'} color="#10b981" />
      </div>

      {/* Category breakdown */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-slate-500 font-mono mb-3">Category Performance</h2>
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {['Category', 'Questions', 'Learners', 'Responses', 'Avg Score'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-slate-500 font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categoryStats.map(c => (
                <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-200">{c.name}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{c.question_count}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{c.unique_learners}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{c.response_count}</td>
                  <td className="px-4 py-3 font-mono">
                    {c.avg_score
                      ? <span style={{ color: c.avg_score >= 75 ? '#10b981' : c.avg_score >= 50 ? '#f59e0b' : '#ef4444' }}>{c.avg_score}%</span>
                      : <span className="text-slate-600">—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
