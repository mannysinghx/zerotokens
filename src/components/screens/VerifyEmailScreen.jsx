import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/gameStore.js'

const inputCls = 'w-full bg-slate-900 border border-slate-700 focus:border-neon-blue rounded-xl px-4 py-3 text-slate-100 font-mono text-sm outline-none transition-colors placeholder:text-slate-600'

const Spinner = () => (
  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    className="w-10 h-10 rounded-full border-2 border-slate-700 mx-auto" style={{ borderTopColor: 'var(--neon-blue)' }} />
)

export default function VerifyEmailScreen() {
  const { goTo, restoreFromSession } = useGameStore()
  const [status,    setStatus]    = useState('loading')
  const [apiError,  setApiError]  = useState('')
  const [token,     setToken]     = useState('')
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [formError, setFormError] = useState('')
  const [saving,    setSaving]    = useState(false)

  useEffect(() => {
    const tok = new URLSearchParams(window.location.search).get('token') ?? ''
    setToken(tok)
    if (!tok) { setStatus('error'); setApiError('No verification token found in URL.'); return }
    fetch('/api/auth/verify-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: tok }) })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setStatus('error'); setApiError(data.error); return }
        if (data.needsPassword) {
          setStatus('needsPassword')
        } else {
          // Individual signup: server returned a session — log them in directly.
          if (data.sessionToken && data.user) {
            restoreFromSession(data.user, data.sessionToken)
            setStatus('verified')
            setTimeout(() => { window.location.href = '/' }, 2000)
          } else {
            // Company re-verify fallback (no session yet): send to login.
            setStatus('verified')
            setTimeout(() => { window.location.href = '/' }, 2000)
          }
        }
      })
      .catch(() => { setStatus('error'); setApiError('Network error. Please try again.') })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSetPassword(e) {
    e.preventDefault()
    if (password.length < 8)  { setFormError('Password must be at least 8 characters.'); return }
    if (password !== confirm)  { setFormError('Passwords do not match.'); return }
    setFormError(''); setSaving(true)
    try {
      const res = await fetch('/api/auth/set-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) })
      const data = await res.json()
      if (!res.ok || data.error) { setFormError(data.error ?? 'Failed to set password.'); return }
      useGameStore.getState().restoreFromSession(data.user, data.sessionToken)
      window.location.href = '/'
    } catch { setFormError('Network error. Please try again.') } finally { setSaving(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="relative z-10 min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ scale: 0.92, opacity: 0, y: 28 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 170, damping: 20 }} className="w-full max-w-md">

        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-neon-blue neon-text" style={{ fontFamily: 'Exo 2' }}>
            TOKEN<span className="text-neon-purple">QUEST</span>
          </h1>
        </div>

        <AnimatePresence mode="wait">
          {status === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="card p-10 text-center space-y-5">
              <Spinner />
              <p className="text-slate-400 font-mono text-sm">Verifying your email…</p>
            </motion.div>
          )}

          {status === 'needsPassword' && (
            <motion.form key="pw" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              onSubmit={handleSetPassword} className="card p-7 space-y-5">
              <div className="text-center">
                <span className="text-4xl block mb-2">🔐</span>
                <h2 className="text-xl font-black text-neon-green neon-text" style={{ fontFamily: 'Exo 2' }}>Email Verified!</h2>
                <p className="text-slate-400 text-sm font-mono mt-1">Set a password to complete your account.</p>
              </div>
              <hr className="glow-divider" />
              <div>
                <label className="block text-xs uppercase tracking-widest text-neon-blue font-mono mb-1.5">New Password</label>
                <input type="password" value={password} onChange={e => { setPassword(e.target.value); setFormError('') }}
                  placeholder="Min 8 characters" autoComplete="new-password" autoFocus className={inputCls} />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-neon-blue font-mono mb-1.5">Confirm Password</label>
                <input type="password" value={confirm} onChange={e => { setConfirm(e.target.value); setFormError('') }}
                  placeholder="Repeat password" autoComplete="new-password" className={inputCls}
                  style={{ borderColor: confirm && confirm !== password ? 'var(--neon-red)' : undefined }} />
              </div>
              <AnimatePresence>
                {formError && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-neon-red text-xs font-mono text-center">⚠ {formError}</motion.p>
                )}
              </AnimatePresence>
              <button type="submit" disabled={saving || !password || !confirm}
                className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none">
                {saving ? 'Saving…' : '⚡ Set Password & Enter Quest'}
              </button>
            </motion.form>
          )}

          {status === 'verified' && (
            <motion.div key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="card p-10 text-center space-y-4">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, ease: 'easeOut' }} className="text-5xl">✅</motion.div>
              <h2 className="text-2xl font-black text-neon-green neon-text" style={{ fontFamily: 'Exo 2' }}>Email Verified!</h2>
              <p className="text-slate-400 font-mono text-sm">Redirecting you to sign in…</p>
              <Spinner />
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div key="err" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="card p-8 text-center space-y-5">
              <span className="text-5xl block">⚠️</span>
              <h2 className="text-xl font-black text-neon-red" style={{ fontFamily: 'Exo 2' }}>Verification Failed</h2>
              <p className="text-slate-400 font-mono text-sm leading-relaxed">{apiError || 'This link may have expired or is invalid.'}</p>
              <hr className="glow-divider" />
              <button onClick={() => goTo('userType')} className="btn-neon w-full text-sm">Back to Start</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
