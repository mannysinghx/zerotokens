/**
 * AddEmployeeModal.jsx
 * Company admin creates a new employee with username + email + password.
 * A verification email is sent; employee clicks the link to activate
 * (password already set, so they are auto-logged in after verifying).
 *
 * Props:
 *   token     — company admin session token
 *   onClose   — called when modal should close
 *   onCreated — called after successful creation (to refresh list)
 */
import { useState } from 'react'
import { coAdminAddEmployee } from '../../utils/api.js'

const inputCls = 'w-full bg-slate-800 border border-slate-700 focus:border-purple-500 rounded-xl px-3 py-2.5 text-slate-100 font-mono text-sm outline-none transition-colors'
const labelCls = 'block text-xs uppercase tracking-widest font-mono mb-1.5'

export default function AddEmployeeModal({ token, onClose, onCreated }) {
  const [username,  setUsername]  = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [saving,    setSaving]    = useState(false)
  const [result,    setResult]    = useState(null)   // { ok, text }
  const [fieldErr,  setFieldErr]  = useState({})

  function validate() {
    const errors = {}
    if (!username.trim())    errors.username = 'Required'
    if (!email.trim())       errors.email    = 'Required'
    if (!password)           errors.password = 'Required'
    else if (password.length < 8) errors.password = 'Min 8 characters'
    if (password !== confirm) errors.confirm = 'Passwords do not match'
    setFieldErr(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    setResult(null)
    try {
      await coAdminAddEmployee(token, {
        username: username.trim(),
        email:    email.trim(),
        password,
      })
      setResult({ ok: true, text: `✓ Account created! A verification email has been sent to ${email.trim()}.` })
      setUsername(''); setEmail(''); setPassword(''); setConfirm('')
      onCreated?.()
    } catch (err) {
      setResult({ ok: false, text: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 px-4">
      <div className="bg-slate-900 border border-violet-800/50 rounded-2xl p-6 w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-black text-slate-100">Add New Employee</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Account is created immediately. Employee verifies email to activate.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-300 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Username */}
          <div>
            <label className={labelCls} style={{ color: '#a855f7' }}>Full Name / Username</label>
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setFieldErr(p => ({ ...p, username: '' })) }}
              placeholder="Jane Smith"
              autoFocus
              className={inputCls}
              style={fieldErr.username ? { borderColor: '#ef4444' } : {}}
            />
            {fieldErr.username && <p className="text-red-400 text-xs font-mono mt-1">{fieldErr.username}</p>}
          </div>

          {/* Email */}
          <div>
            <label className={labelCls} style={{ color: '#a855f7' }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setFieldErr(p => ({ ...p, email: '' })) }}
              placeholder="jane@company.com"
              className={inputCls}
              style={fieldErr.email ? { borderColor: '#ef4444' } : {}}
            />
            {fieldErr.email && <p className="text-red-400 text-xs font-mono mt-1">{fieldErr.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className={labelCls} style={{ color: '#a855f7' }}>Temporary Password</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setFieldErr(p => ({ ...p, password: '', confirm: '' })) }}
              placeholder="Min 8 characters"
              autoComplete="new-password"
              className={inputCls}
              style={fieldErr.password ? { borderColor: '#ef4444' } : {}}
            />
            {fieldErr.password && <p className="text-red-400 text-xs font-mono mt-1">{fieldErr.password}</p>}
          </div>

          {/* Confirm password */}
          <div>
            <label className={labelCls} style={{ color: '#a855f7' }}>Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setFieldErr(p => ({ ...p, confirm: '' })) }}
              placeholder="Repeat password"
              autoComplete="new-password"
              className={inputCls}
              style={fieldErr.confirm || (confirm && confirm !== password) ? { borderColor: '#ef4444' } : {}}
            />
            {fieldErr.confirm && <p className="text-red-400 text-xs font-mono mt-1">{fieldErr.confirm}</p>}
          </div>

          {/* Result message */}
          {result && (
            <p className={`text-sm font-mono rounded-xl px-4 py-3 ${result.ok ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50' : 'bg-red-900/30 text-red-400 border border-red-800/50'}`}>
              {result.text}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-mono font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              style={{ background: 'linear-gradient(90deg, #7c3aed, #a855f7)' }}
            >
              {saving ? 'Creating…' : '➕ Create & Send Email'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-mono text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Info note */}
        <p className="mt-4 text-xs text-slate-600 font-mono text-center">
          📁 Remind employee to check Spam/Junk if they don't see the email.
        </p>
      </div>
    </div>
  )
}
