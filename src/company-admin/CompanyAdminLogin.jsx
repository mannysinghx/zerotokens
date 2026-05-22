/**
 * CompanyAdminLogin.jsx
 * Login form for the company admin portal.
 * Dark theme with violet accent.
 */
import { useState } from 'react'

export default function CompanyAdminLogin({ onLogin, externalError }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [busy,     setBusy]     = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setBusy(true)
    setError('')
    try {
      await onLogin(email.trim(), password)
    } catch (err) {
      if (err.message?.toLowerCase().includes('company admin')) {
        setError("You don't have company admin access for any company.")
      } else if (err.message?.toLowerCase().includes('unauthorized') || err.message?.toLowerCase().includes('invalid')) {
        setError('Incorrect email or password.')
      } else {
        setError(err.message || 'Login failed.')
      }
    } finally {
      setBusy(false)
    }
  }

  const displayError = error || externalError

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Portal URL notice */}
        <div className="text-center mb-6">
          <p className="text-slate-700 text-xs font-mono">
            www.zerotokens.ai<span style={{ color: '#a855f7' }}>/company-admin</span>
          </p>
        </div>

        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏢</div>
          <h1
            className="text-2xl font-black text-slate-100 mb-1"
            style={{ fontFamily: 'Exo 2' }}
          >
            TOKEN<span style={{ color: '#a855f7' }}>QUEST</span>
          </h1>
          <p className="text-slate-400 text-sm font-mono">Company Admin Portal</p>
          <p className="text-slate-600 text-xs font-mono mt-1">Sign in with your employee account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest font-mono mb-1" style={{ color: '#a855f7' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              placeholder="your@company.com"
              autoFocus
              required
              className="w-full bg-slate-900 border border-slate-700 focus:border-purple-500 rounded-xl px-4 py-3 text-slate-100 font-mono text-sm outline-none transition-colors"
              style={{ '--tw-ring-color': '#a855f7' }}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest font-mono mb-1" style={{ color: '#a855f7' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="Your password"
              required
              className="w-full bg-slate-900 border border-slate-700 focus:border-purple-500 rounded-xl px-4 py-3 text-slate-100 font-mono text-sm outline-none transition-colors"
            />
          </div>

          {displayError && (
            <p className="text-red-400 text-xs font-mono text-center">⚠ {displayError}</p>
          )}

          <button
            type="submit"
            disabled={!email.trim() || !password.trim() || busy}
            className="w-full font-bold py-3 rounded-xl transition-colors text-white disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: busy ? '#7c3aed' : 'linear-gradient(90deg, #7c3aed, #a855f7)' }}
          >
            {busy ? 'Signing in…' : '→ Sign in to Company Admin'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-700 font-mono mt-6">
          Token Quest · ZeroTokens.ai · Company admins only
        </p>
      </div>
    </div>
  )
}
