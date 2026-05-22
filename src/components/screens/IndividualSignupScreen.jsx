import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/gameStore.js'

function pwStrength(pw) {
  if (!pw || pw.length < 8) return 'weak'
  const score = [/[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(pw)).length
  return score >= 3 ? 'strong' : score === 2 ? 'medium' : 'weak'
}
const STRENGTH = { weak: ['var(--neon-red)', 1, 'Weak'], medium: ['var(--neon-amber)', 2, 'Medium'], strong: ['var(--neon-green)', 3, 'Strong'] }

const inputCls = 'w-full bg-slate-900 border border-slate-700 focus:border-neon-blue rounded-xl px-4 py-3 text-slate-100 font-mono text-sm outline-none transition-colors placeholder:text-slate-600'

function Field({ label, type, value, onChange, placeholder, extra, autoFocus, autoComplete }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-neon-blue font-mono mb-1.5">{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} autoFocus={autoFocus}
        autoComplete={autoComplete} className={inputCls} style={extra} />
    </div>
  )
}

function ErrorMsg({ error }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="text-neon-red text-xs font-mono text-center">
          ⚠ {error}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

export default function IndividualSignupScreen() {
  const { goTo, login, register } = useGameStore()
  const [mode, setMode]       = useState('signup')
  const [un,   setUn]         = useState('')
  const [em,   setEm]         = useState('')
  const [pw,   setPw]         = useState('')
  const [cpw,  setCpw]        = useState('')
  const [lem,  setLem]        = useState('')
  const [lpw,  setLpw]        = useState('')
  const [err,  setErr]        = useState('')
  const [loading, setLoading] = useState(false)
  const [sentTo,  setSentTo]  = useState('')

  const strength = pw ? pwStrength(pw) : null
  const [sColor, sBars, sLabel] = strength ? STRENGTH[strength] : []

  function clr() { setErr('') }

  async function handleSignup(e) {
    e.preventDefault()
    if (un.trim().length < 2)          { setErr('Username must be at least 2 characters.'); return }
    if (un.trim().length > 30)         { setErr('Username must be under 30 characters.'); return }
    if (!/\S+@\S+\.\S+/.test(em))      { setErr('Please enter a valid email.'); return }
    if (pw.length < 8)                 { setErr('Password must be at least 8 characters.'); return }
    if (pw !== cpw)                    { setErr('Passwords do not match.'); return }
    setErr(''); setLoading(true)
    try {
      const r = await register(un.trim(), em.trim(), pw, 'individual')
      if (r?.success) { setSentTo(em.trim()) }
      else { setErr(r?.error ?? 'Registration failed.') }
    } catch { setErr('Something went wrong.') } finally { setLoading(false) }
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (!lem.trim() || !lpw) { setErr('Please fill in all fields.'); return }
    setErr(''); setLoading(true)
    try {
      const r = await login(lem.trim(), lpw)
      r?.success ? goTo('landing') : setErr(r?.error ?? 'Invalid email or password.')
    } catch { setErr('Something went wrong.') } finally { setLoading(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
      <motion.div initial={{ scale: 0.92, opacity: 0, y: 28 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 170, damping: 20 }} className="w-full max-w-md">

        <button onClick={() => goTo('userType')}
          className="flex items-center gap-2 text-slate-500 hover:text-neon-blue text-sm font-mono mb-6 transition-colors">
          ← Back
        </button>

        <div className="text-center mb-6">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="text-5xl mb-3">🎮</motion.div>
          <h1 className="text-3xl font-black neon-text text-neon-purple mb-1" style={{ fontFamily: 'Exo 2' }}>
            TOKEN<span className="text-neon-blue">QUEST</span>
          </h1>
          <p className="text-slate-500 text-sm font-mono">{mode === 'signup' ? 'Create your free account' : 'Welcome back'}</p>
        </div>

        {/* Email sent confirmation */}
        <AnimatePresence>
          {sentTo && (
            <motion.div key="sent" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="card p-8 text-center space-y-4">
              <div className="text-5xl">📬</div>
              <h2 className="text-xl font-black text-neon-green neon-text" style={{ fontFamily: 'Exo 2' }}>Check Your Email</h2>
              <p className="text-slate-400 text-sm font-mono leading-relaxed">
                We sent a verification link to<br/>
                <span className="text-neon-blue">{sentTo}</span>
              </p>
              <p className="text-slate-600 text-xs font-mono">Click the link to verify your account and start playing. The link expires in 24 hours.</p>
              <p className="text-slate-500 text-xs font-mono">
                📁 Can't find it? Check your <span className="text-neon-amber">Spam</span> or <span className="text-neon-amber">Junk</span> folder.
              </p>
              <hr className="glow-divider" />
              <button onClick={() => { setSentTo(''); setMode('login') }}
                className="btn-neon w-full text-sm">
                Already verified? Log In
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mode tabs + forms — hidden once verification email is sent */}
        {!sentTo && (<>
          <div className="flex gap-1 mb-5 bg-slate-900 border border-slate-800 rounded-xl p-1">
            {['signup', 'login'].map(m => (
              <button key={m} type="button" onClick={() => { setMode(m); setErr('') }}
                className="flex-1 py-2 rounded-lg text-sm font-mono font-bold transition-all"
                style={{ background: mode === m ? 'linear-gradient(135deg,#0284c7,#7c3aed)' : 'transparent', color: mode === m ? '#fff' : '#64748b' }}>
                {m === 'signup' ? 'Sign Up' : 'Log In'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {mode === 'signup' ? (
              <motion.form key="signup" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                onSubmit={handleSignup} className="card p-6 space-y-4">
                <Field label="Username" type="text" value={un} onChange={e => { setUn(e.target.value); clr() }} placeholder="TokenHunter" autoFocus autoComplete="username" />
                <Field label="Email" type="email" value={em} onChange={e => { setEm(e.target.value); clr() }} placeholder="you@example.com" autoComplete="email" />
                <div>
                  <Field label="Password" type="password" value={pw} onChange={e => { setPw(e.target.value); clr() }} placeholder="Min 8 characters" autoComplete="new-password" />
                  {strength && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3].map(i => <div key={i} className="flex-1 h-1.5 rounded-full transition-all" style={{ background: i <= sBars ? sColor : 'rgba(255,255,255,0.08)' }} />)}
                      </div>
                      <p className="text-xs font-mono" style={{ color: sColor }}>{sLabel}</p>
                    </div>
                  )}
                </div>
                <Field label="Confirm Password" type="password" value={cpw} onChange={e => { setCpw(e.target.value); clr() }} placeholder="Repeat password" autoComplete="new-password"
                  extra={{ borderColor: cpw && cpw !== pw ? 'var(--neon-red)' : undefined }} />
                {cpw && cpw !== pw && <p className="text-neon-red text-xs font-mono -mt-2">Passwords do not match.</p>}
                <ErrorMsg error={err} />
                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none">
                  {loading ? 'Creating account…' : '⚡ Create Free Account'}
                </button>
                <p className="text-center text-xs text-slate-700 font-mono">Free forever · No credit card needed</p>
              </motion.form>
            ) : (
              <motion.form key="login" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                onSubmit={handleLogin} className="card p-6 space-y-4">
                <Field label="Email" type="email" value={lem} onChange={e => { setLem(e.target.value); clr() }} placeholder="you@example.com" autoFocus autoComplete="email" />
                <Field label="Password" type="password" value={lpw} onChange={e => { setLpw(e.target.value); clr() }} placeholder="••••••••" autoComplete="current-password" />
                <ErrorMsg error={err} />
                <button type="submit" disabled={loading || !lem.trim() || !lpw}
                  className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none">
                  {loading ? 'Signing in…' : '⚡ Log In'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </>)}
      </motion.div>
    </motion.div>
  )
}
