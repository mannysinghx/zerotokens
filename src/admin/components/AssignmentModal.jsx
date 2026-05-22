/**
 * AssignmentModal.jsx
 * Category → Sub-Function → Role dropdowns → Save assignment.
 */
import { useState } from 'react'
import { FIELD_CATEGORIES } from '../../data/fieldCategories.js'
import { adminAssignEmployee } from '../../utils/api.js'

export default function AssignmentModal({ employee, password, onClose, onSaved }) {
  const [categoryId,   setCategoryId]   = useState('')
  const [subFunction,  setSubFunction]  = useState('')
  const [role,         setRole]         = useState('')
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState('')

  const selectedCategory = FIELD_CATEGORIES.find(c => c.id === categoryId)
  const selectedSub      = selectedCategory?.subFunctions.find(s => s.name === subFunction)

  async function handleSave() {
    if (!categoryId) { setError('Please select a category.'); return }
    setSaving(true)
    setError('')
    try {
      await adminAssignEmployee(password, {
        employeeId:  employee.id,
        categoryId,
        subFunction: subFunction || null,
        role:        role        || null,
      })
      onSaved?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="mb-5">
          <h2 className="text-lg font-black text-slate-100">Assign Course</h2>
          <p className="text-sm text-slate-400 font-mono mt-0.5">
            {employee.username}
            {(employee.team || employee.company) && (
              <span className="text-slate-600"> · {[employee.team, employee.company].filter(Boolean).join(' / ')}</span>
            )}
          </p>
        </div>

        <div className="space-y-4">
          {/* Category */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-500 font-mono mb-2">Category</label>
            <select
              value={categoryId}
              onChange={e => { setCategoryId(e.target.value); setSubFunction(''); setRole('') }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm outline-none focus:border-cyan-500"
            >
              <option value="">— Select category —</option>
              {FIELD_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
              ))}
            </select>
          </div>

          {/* Sub-function */}
          {selectedCategory && (
            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-500 font-mono mb-2">
                Sub-Function <span className="text-slate-600 normal-case">(optional)</span>
              </label>
              <select
                value={subFunction}
                onChange={e => { setSubFunction(e.target.value); setRole('') }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm outline-none focus:border-cyan-500"
              >
                <option value="">— All sub-functions —</option>
                {selectedCategory.subFunctions.map(s => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Role */}
          {selectedSub && (
            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-500 font-mono mb-2">
                Role <span className="text-slate-600 normal-case">(optional)</span>
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm outline-none focus:border-cyan-500"
              >
                <option value="">— Select role —</option>
                {selectedSub.roles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={!categoryId || saving}
            className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
          >
            {saving ? 'Saving…' : '✓ Assign Course'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-mono text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
