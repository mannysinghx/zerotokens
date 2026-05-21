import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/gameStore.js'
import { playSuccess, playClick } from '../../utils/sound.js'

const SUGGESTIONS = [
  'Prompt Wizard', 'Token Hunter', 'Context Slayer',
  'Byte Ninja', 'Signal Pro', 'Zero Waste',
  'AI Whisperer', 'Syntax Ace', 'Cache Master',
]

const ROBOT_LINES = [
  "What should I call you, human?",
  "Pick a name. The villains are waiting.",
  "Your legend begins with a name.",
  "Token waste fears a named opponent.",
]

function getRobotLine() {
  return ROBOT_LINES[Math.floor(Math.random() * ROBOT_LINES.length)]
}

function validate(name) {
  const t = name.trim()
  if (t.length < 2)  return 'At least 2 characters, please.'
  if (t.length > 20) return 'Max 20 characters.'
  if (!/^[\w\s\-\.]+$/i.test(t)) return 'Letters, numbers, spaces, - and . only.'
  return null
}

export default function UsernameScreen() {
  const { setUsername, soundEnabled } = useGameStore()
  const [name,    setName]    = useState('')
  const [error,   setError]   = useState('')
  const [shaking, setShaking] = useState(false)
  const inputRef = useRef(null)
  const robotLine = useRef(getRobotLine()).current

  useEffect(() => { inputRef.current?.focus() }, [])

  function handleSubmit(e) {
    e?.preventDefault()
    const err = validate(name)
    if (err) {
      setError(err)
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
      return
    }
    if (soundEnabled) playSuccess()
    setUsername(name.trim())
  }

  function pickSuggestion(s) {
    if (soundEnabled) playClick()
    setName(s)
    setError('')
    inputRef.current?.focus()
  }

  const isValid = validate(name) === null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 min-h-screen flex items-center justify-center px-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1,   opacity: 1, y: 0  }}
        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        className="w-full max-w-md"
      >
        {/* Robot mascot */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-center mb-6"
        >
          <span className="text-7xl inline-block">🤖</span>
        </motion.div>

        {/* Card */}
        <div className="card p-8 neon-border">
          {/* Title */}
          <div className="text-center mb-6">
            <h1
              className="text-3xl font-black text-neon-blue neon-text mb-2"
              style={{ fontFamily: 'Exo 2' }}
            >
              TOKEN<span className="text-neon-purple">QUEST</span>
            </h1>
            <p className="text-slate-400 text-sm font-mono italic">
              "{robotLine}"
            </p>
          </div>

          <hr className="glow-divider mb-6" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-widest font-mono block mb-2">
                Your Name / Alias
              </label>
              <motion.div animate={shaking ? { x: [-8, 8, -6, 6, 0] } : {}}>
                <input
                  ref={inputRef}
                  type="text"
                  className="prompt-input text-base"
                  placeholder="e.g. Token Hunter, ByteNinja…"
                  value={name}
                  maxLength={20}
                  onChange={e => { setName(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  style={{ minHeight: 'unset', height: '48px' }}
                  autoComplete="off"
                  spellCheck={false}
                />
              </motion.div>

              <div className="flex items-center justify-between mt-1.5">
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-neon-red font-mono"
                    >
                      ⚠ {error}
                    </motion.p>
                  )}
                </AnimatePresence>
                <span className="text-xs text-slate-600 font-mono ml-auto">
                  {name.length}/20
                </span>
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <p className="text-xs text-slate-600 font-mono mb-2">Quick picks:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.slice(0, 6).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => pickSuggestion(s)}
                    className="text-xs px-2.5 py-1 rounded-lg border transition-all hover:scale-105"
                    style={{
                      borderColor: name === s ? 'var(--neon-blue)' : 'rgba(255,255,255,0.08)',
                      color:       name === s ? 'var(--neon-blue)' : '#64748b',
                      background:  name === s ? 'rgba(0,212,255,0.08)' : 'transparent',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              type="submit"
              disabled={!name.trim()}
              className="btn-primary w-full text-lg py-4 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isValid ? `⚡ Enter the Quest, ${name.trim()}!` : '⚡ Enter the Quest'}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-center text-xs text-slate-700 mt-4 font-mono">
            Saved locally · No account needed · No data leaves your device
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
