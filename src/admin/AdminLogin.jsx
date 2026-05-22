/**
 * AdminLogin.jsx
 * Password gate for the admin panel.
 * Password is checked server-side (x-admin-password header); this is just the UI.
 */
import { useState } from 'react'
import { adminFetchStats } from '../utils/api.js'

export default function AdminLogin({ onLogin }) {
  const [pw,    setPw]    = useState('')
  const [error, setError] = useState('')
  const [busy,  setBusy]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!pw.trim()) return
    setBusy(true)
    setError('')
    try {
      // Validate password by hitting a real API endpoint
      await adminFetchStats(pw.trim())
      onLogin(pw.trim())
    } catch (err) {
      setError(err.message.includes('Unauthorized') ? 'Incorrect password.' : `Error: ${err.message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-2xl font-black text-slate-100 mb-1" style={{ fontFamily: 'Exo 2' }}>
            Token Quest Admin
          </h1>
          <p className="text-slate-500 text-sm font-mono">Enter your admin password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setError('') }}
            placeholder="Admin password"
            autoFocus
            className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-slate-100 font-mono text-sm outline-none transition-colors"
          />

          {error && (
            <p className="text-red-400 text-xs font-mono text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={!pw.trim() || busy}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
          >
            {busy ? 'Checking…' : '→ Enter Admin Panel'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-700 font-mono mt-6">
          Set ADMIN_PASSWORD in your Vercel environment variables.
        </p>
      </div>
    </div>
  )
}
