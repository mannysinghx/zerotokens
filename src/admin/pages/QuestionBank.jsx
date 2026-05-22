/**
 * QuestionBank.jsx
 * Browse questions by category. Shows count, mode breakdown, and sample questions.
 * Note: questions are seeded via seed.js and are read-only here.
 */
import { useEffect, useState } from 'react'
import { FIELD_CATEGORIES } from '../../data/fieldCategories.js'

const MODE_COLORS = {
  fix_prompt:   '#00d4ff',
  choose_best:  '#a855f7',
  token_budget: '#10b981',
}

const MODE_LABELS = {
  fix_prompt:   'Fix Prompt',
  choose_best:  'Choose Best',
  token_budget: 'Token Budget',
}

export default function QuestionBank({ password }) {
  const [selectedCat,   setSelectedCat]   = useState(FIELD_CATEGORIES[0].id)
  const [questions,     setQuestions]     = useState([])
  const [loading,       setLoading]       = useState(false)
  const [filterMode,    setFilterMode]    = useState('')
  const [filterDiff,    setFilterDiff]    = useState('')
  const [expanded,      setExpanded]      = useState(null)

  useEffect(() => {
    if (!selectedCat) return
    setLoading(true)
    setExpanded(null)
    fetch(`/api/questions/field?categoryId=${selectedCat}&count=100`, {
      headers: { 'x-admin-password': password },
    })
      .then(r => r.json())
      .then(d => setQuestions(d.questions || []))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false))
  }, [selectedCat, password])

  const filtered = questions.filter(q =>
    (!filterMode || q.mode === filterMode) &&
    (!filterDiff || q.difficulty === filterDiff),
  )

  const cat = FIELD_CATEGORIES.find(c => c.id === selectedCat)

  // Mode counts
  const modeCounts = questions.reduce((acc, q) => {
    acc[q.mode] = (acc[q.mode] || 0) + 1
    return acc
  }, {})

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-100 mb-1" style={{ fontFamily: 'Exo 2' }}>Question Bank</h1>
      <p className="text-slate-500 text-sm font-mono mb-6">Browse the 600 seeded AI prompt optimisation questions.</p>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FIELD_CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCat(c.id)}
            className={`text-xs px-3 py-1.5 rounded-full font-mono border transition-colors ${
              selectedCat === c.id
                ? 'border-current'
                : 'border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
            style={selectedCat === c.id ? { borderColor: c.color, color: c.color, background: c.color + '15' } : {}}
          >
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      {/* Mode breakdown */}
      <div className="flex gap-4 mb-5">
        {Object.entries(modeCounts).map(([mode, count]) => (
          <div key={mode} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: MODE_COLORS[mode] }} />
            <span className="text-xs font-mono text-slate-400">{MODE_LABELS[mode]}: {count}</span>
          </div>
        ))}
        {questions.length > 0 && (
          <span className="text-xs font-mono text-slate-600 ml-auto">Total: {questions.length}</span>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select
          value={filterMode}
          onChange={e => setFilterMode(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-300 font-mono text-xs outline-none focus:border-cyan-500"
        >
          <option value="">All modes</option>
          {Object.entries(MODE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select
          value={filterDiff}
          onChange={e => setFilterDiff(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-300 font-mono text-xs outline-none focus:border-cyan-500"
        >
          <option value="">All difficulties</option>
          {['beginner', 'intermediate', 'advanced', 'expert'].map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-slate-500 font-mono text-sm py-8 text-center">Loading questions…</p>}

      {!loading && (
        <div className="space-y-2">
          {filtered.map((q, i) => (
            <div
              key={q.id}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
            >
              <button
                className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-800/40 transition-colors"
                onClick={() => setExpanded(expanded === q.id ? null : q.id)}
              >
                <span
                  className="text-xs font-mono px-2 py-0.5 rounded border shrink-0"
                  style={{ borderColor: MODE_COLORS[q.mode] + '44', color: MODE_COLORS[q.mode] }}
                >
                  {MODE_LABELS[q.mode]}
                </span>
                <span className="text-xs font-mono text-slate-500 shrink-0 w-20">{q.sub_function ?? q.subFunction}</span>
                <span className="text-sm font-mono text-slate-300 flex-1 truncate">{q.title}</span>
                <span className={`text-xs font-mono shrink-0 ${
                  q.difficulty === 'expert' ? 'text-red-400' :
                  q.difficulty === 'advanced' ? 'text-orange-400' :
                  q.difficulty === 'intermediate' ? 'text-yellow-500' : 'text-green-500'
                }`}>{q.difficulty}</span>
                <span className="text-slate-600 text-xs">{expanded === q.id ? '▲' : '▼'}</span>
              </button>

              {expanded === q.id && (
                <div className="px-4 pb-4 border-t border-slate-800 pt-3 space-y-3">
                  <div>
                    <div className="text-xs text-slate-600 font-mono mb-1">Original Prompt</div>
                    <div className="text-sm text-slate-300 font-mono bg-slate-800/50 rounded-lg px-3 py-2 italic">
                      "{q.original_prompt ?? q.originalPrompt}"
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 font-mono mb-1">Options</div>
                    {(q.options || []).map((opt, oi) => (
                      <div
                        key={oi}
                        className={`text-xs font-mono px-3 py-1.5 rounded-lg mb-1 ${
                          oi === (q.correct_option ?? q.correctOption)
                            ? 'bg-green-900/30 text-green-400 border border-green-800/60'
                            : 'bg-slate-800/30 text-slate-500'
                        }`}
                      >
                        {oi === (q.correct_option ?? q.correctOption) ? '✓ ' : '   '}{opt}
                      </div>
                    ))}
                  </div>
                  {(q.hint) && (
                    <div className="text-xs text-slate-500 font-mono">
                      💡 Hint: {q.hint}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-slate-600 font-mono text-sm text-center py-8">
              {questions.length === 0
                ? 'No questions found. Run the seed script to populate this category.'
                : 'No questions match the selected filters.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
