/**
 * ResponseViewer.jsx
 * Table of all employee responses. Filter by employee, category, date.
 * CSV export button.
 */
import { useEffect, useState, useCallback } from 'react'
import { adminFetchEmployees, adminFetchResponses } from '../../utils/api.js'
import { FIELD_CATEGORIES } from '../../data/fieldCategories.js'

const GRADE_COLORS = { S: '#00d4ff', A: '#10b981', B: '#a855f7', C: '#f59e0b', D: '#ef4444' }

function exportCSV(rows) {
  const headers = ['Employee', 'Team', 'Company', 'Category', 'Sub-Function', 'Question', 'Score', 'Grade', 'Correct', 'Tokens Saved', 'Answered At']
  const lines = rows.map(r => [
    r.username, r.team ?? '', r.company ?? '', r.category_id, r.sub_function ?? '',
    (r.question_title ?? '').replace(/,/g, ';'),
    r.total_score ?? '', r.grade ?? '', r.is_correct ? 'Yes' : 'No',
    r.tokens_saved ?? '', new Date(r.answered_at).toLocaleString(),
  ].join(','))
  const blob = new Blob([[headers.join(','), ...lines].join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tokenquest-responses-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function ResponseViewer({ password }) {
  const [employees,  setEmployees]  = useState([])
  const [responses,  setResponses]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [empFilter,  setEmpFilter]  = useState('')
  const [catFilter,  setCatFilter]  = useState('')

  const loadEmployees = useCallback(() => {
    adminFetchEmployees(password)
      .then(d => setEmployees(d.employees || []))
      .catch(() => {})
  }, [password])

  const loadResponses = useCallback(() => {
    setLoading(true)
    adminFetchResponses(password, {
      employeeId: empFilter || undefined,
      categoryId: catFilter || undefined,
      limit: 200,
    })
      .then(d => setResponses(d.responses || []))
      .catch(() => setResponses([]))
      .finally(() => setLoading(false))
  }, [password, empFilter, catFilter])

  useEffect(() => { loadEmployees() }, [loadEmployees])
  useEffect(() => { loadResponses() }, [loadResponses])

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-100" style={{ fontFamily: 'Exo 2' }}>Responses</h1>
          <p className="text-slate-500 text-sm font-mono mt-0.5">{responses.length} shown</p>
        </div>
        <button
          onClick={() => exportCSV(responses)}
          disabled={responses.length === 0}
          className="text-sm px-4 py-2 rounded-xl bg-emerald-900/40 text-emerald-400 border border-emerald-800/60 font-mono hover:bg-emerald-800/60 disabled:opacity-40 transition-colors"
        >
          ↓ Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <select
          value={empFilter}
          onChange={e => setEmpFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 font-mono text-sm outline-none focus:border-cyan-500 flex-1 min-w-[180px]"
        >
          <option value="">All employees</option>
          {employees.map(e => (
            <option key={e.id} value={e.id}>{e.username}{e.team ? ` (${e.team})` : ''}</option>
          ))}
        </select>
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 font-mono text-sm outline-none focus:border-cyan-500 flex-1 min-w-[180px]"
        >
          <option value="">All categories</option>
          {FIELD_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
        </select>
      </div>

      {loading && <p className="text-slate-500 font-mono text-sm py-8 text-center">Loading…</p>}

      {!loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800">
                {['Employee', 'Question', 'Score', 'Grade', 'Correct', 'Tokens Saved', 'Answered'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-slate-500 font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {responses.map(r => (
                <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono text-slate-200 text-xs">{r.username}</div>
                    {r.team && <div className="text-xs text-slate-600 font-mono">{r.team}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-slate-300 text-xs max-w-[200px] truncate" title={r.question_title}>{r.question_title}</div>
                    <div className="text-xs text-slate-600 font-mono">{r.sub_function}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">
                    <span style={{ color: r.total_score >= 75 ? '#10b981' : r.total_score >= 50 ? '#f59e0b' : '#ef4444' }}>
                      {r.total_score ?? '—'}%
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-sm">
                    <span style={{ color: GRADE_COLORS[r.grade] }}>{r.grade ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-mono ${r.is_correct ? 'text-green-400' : 'text-red-400'}`}>
                      {r.is_correct ? '✓' : '✗'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400 text-xs">{r.tokens_saved?.toLocaleString() ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-slate-500 text-xs">
                    {new Date(r.answered_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {responses.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-600 font-mono text-sm">
                    No responses found for the selected filters.
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
