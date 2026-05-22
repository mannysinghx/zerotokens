/**
 * EmployeeRegistrationScreen.jsx
 * Corporate employee onboarding — collects Name (required), Team and Company (optional).
 * Replaces UsernameScreen for new users in corporate mode.
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import useGameStore from '../../store/gameStore.js'

const NAME_REGEX = /^[a-zA-Z0-9 .'-]{2,50}$/

const TEAM_SUGGESTIONS = [
  'Engineering', 'Product', 'Marketing', 'Sales',
  'HR', 'Finance', 'Operations', 'Design',
]

export default function EmployeeRegistrationScreen() {
  const { setEmployee } = useGameStore()

  const [name,    setName]    = useState('')
  const [team,    setTeam]    = useState('')
  const [company, setCompany] = useState('')
  const [error,   setError]   = useState('')
  const [teamOpen, setTeamOpen] = useState(false)

  const nameValid = NAME_REGEX.test(name.trim())

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { setError('Please enter your full name.'); return }
    if (!nameValid)   { setError('Name must be 2–50 characters (letters, numbers, spaces, . \' - allowed).'); return }
    setError('')
    setEmployee(name.trim(), team.trim() || null, company.trim() || null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="text-5xl mb-4"
          >
            🏢
          </motion.div>
          <h1
            className="text-3xl font-black mb-1 neon-text"
            style={{ fontFamily: 'Exo 2', color: '#00d4ff' }}
          >
            Employee Registration
          </h1>
          <p className="text-slate-400 text-sm font-mono">
            TokenQuest · AI Prompt Optimisation Training
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card p-6 space-y-5">

          {/* Full Name — required */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-neon-blue font-mono mb-2">
              Full Name <span className="text-neon-red">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder="e.g. Jane Smith"
              maxLength={50}
              autoFocus
              className="w-full bg-slate-900 border border-slate-700 focus:border-neon-blue rounded-xl px-4 py-3 text-slate-100 font-mono text-sm outline-none transition-colors placeholder:text-slate-600"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-slate-600 font-mono">Required · used on your certificate</span>
              <span className={`text-xs font-mono ${name.length >= 45 ? 'text-neon-amber' : 'text-slate-600'}`}>
                {name.length}/50
              </span>
            </div>
          </div>

          {/* Team / Department — optional */}
          <div className="relative">
            <label className="block text-xs uppercase tracking-widest text-slate-500 font-mono mb-2">
              Team / Department
              <span className="ml-2 text-slate-700 normal-case tracking-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={team}
              onChange={e => { setTeam(e.target.value); setTeamOpen(false) }}
              onFocus={() => setTeamOpen(true)}
              onBlur={() => setTimeout(() => setTeamOpen(false), 150)}
              placeholder="e.g. Engineering, Sales, HR"
              maxLength={40}
              className="w-full bg-slate-900 border border-slate-700 focus:border-neon-purple rounded-xl px-4 py-3 text-slate-100 font-mono text-sm outline-none transition-colors placeholder:text-slate-600"
            />
            {/* Quick-pick suggestions */}
            {teamOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden"
              >
                <div className="flex flex-wrap gap-1.5 p-3">
                  {TEAM_SUGGESTIONS.filter(s =>
                    !team || s.toLowerCase().includes(team.toLowerCase()),
                  ).map(s => (
                    <button
                      key={s}
                      type="button"
                      onMouseDown={() => setTeam(s)}
                      className="text-xs font-mono px-2.5 py-1 rounded-full border border-neon-purple/30 bg-neon-purple/5 text-neon-purple hover:bg-neon-purple/15 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Company / Organisation — optional */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-500 font-mono mb-2">
              Company / Organisation
              <span className="ml-2 text-slate-700 normal-case tracking-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="e.g. Acme Corp"
              maxLength={60}
              className="w-full bg-slate-900 border border-slate-700 focus:border-neon-green rounded-xl px-4 py-3 text-slate-100 font-mono text-sm outline-none transition-colors placeholder:text-slate-600"
            />
          </div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-neon-red text-xs font-mono text-center"
            >
              {error}
            </motion.p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!name.trim()}
            className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ⚡ Start Training
          </button>

          {/* Privacy note */}
          <p className="text-center text-xs text-slate-700 font-mono">
            All data is stored locally on this device only.
          </p>
        </form>

        {/* What to expect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 grid grid-cols-3 gap-3 text-center"
        >
          {[
            { icon: '🎯', label: '25 Challenges' },
            { icon: '🎓', label: '3 Cert Levels'  },
            { icon: '🏆', label: 'Team Leaderboard' },
          ].map(({ icon, label }) => (
            <div key={label} className="card p-3">
              <div className="text-xl mb-1">{icon}</div>
              <div className="text-xs text-slate-500 font-mono">{label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
