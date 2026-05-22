import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/gameStore.js'

export default function CompanyLoginScreen() {
  const { goTo, login } = useGameStore()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showNote, setShowNote] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !password)  { setError('Please fill in all fields.'); return }
    setError('')
    setLoading(true)
    try {
      const result = await login(email.trim(), password)
      if (result?.success) {
        goTo('landing')
      } else {
        setError(result?.error ?? 'Invalid email or password. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 min-h-screen flex items-center justify-center px-4"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 28 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        transition={{ type: 'spring', stiffness: 170, damping: 20 }}
        className="w-full max-w-md"
      >
        {/* Back button */}
        <button
          onClick={() => goTo('userType')}
          className="flex items-center gap-2 text-slate-500 hover:text-neon-blue text-sm font-mono mb-6 transition-colors"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="text-5xl mb-3"
          >
            🏢
          </motion.div>
          <h1
            className="text-3xl font-black text-neon-blue neon-text mb-1"
            style={{ fontFamily: 'Exo 2' }}
          >
            TOKEN<span className="text-neon-purple">QUEST</span>
          </h1>
          <p className="text-slate-500 text-sm font-mono">Company Employee Sign In</p>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} className="card p-7 space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-neon-blue font-mono mb-2">
              Work Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              placeholder="you@company.com"
              autoComplete="email"
              autoFocus
              className="w-full bg-slate-900 border border-slate-700 focus:border-neon-blue rounded-xl px-4 py-3 text-slate-100 font-mono text-sm outline-none transition-colors placeholder:text-slate-600"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-neon-blue font-mono mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full bg-slate-900 border border-slate-700 focus:border-neon-blue rounded-xl px-4 py-3 text-slate-100 font-mono text-sm outline-none transition-colors placeholder:text-slate-600"
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-neon-red text-xs font-mono text-center"
              >
                ⚠ {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Signing in…' : '⚡ Sign In'}
          </button>

          <hr className="glow-divider" />

          {/* Invite note */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowNote(v => !v)}
              className="text-xs text-slate-600 hover:text-slate-400 font-mono underline underline-offset-2 transition-colors"
            >
              Haven't received your invitation?
            </button>
            <AnimatePresence>
              {showNote && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-slate-500 text-xs font-mono mt-2 leading-relaxed overflow-hidden"
                >
                  Contact your admin to be invited to Token Quest.
                  They can add you from the Admin Dashboard.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
