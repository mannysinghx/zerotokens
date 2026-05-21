import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/gameStore.js'
import { playClick, playLevelUp } from '../../utils/sound.js'
import { VILLAINS, getVillainProgress } from '../../data/villains.js'

const features = [
  { icon: '✍️', title: 'Fix the Prompt',     desc: 'Rewrite wasteful AI prompts into lean, powerful ones.' },
  { icon: '🎯', title: 'Choose the Best',    desc: 'Pick the most efficient option from 3 candidates.' },
  { icon: '⏱️', title: 'Token Budget',        desc: 'Craft a complete prompt under a strict token limit.' },
  { icon: '🐉', title: 'Boss Battle',        desc: 'Survive 5 rounds to defeat the Token Monster.' },
]

// ── Welcome-back screen ─────────────────────────────────────────────────────
function WelcomeBack() {
  const {
    username, coins, xp, streak, completedChallenges,
    totalTokensSaved, badges, sessions, joinedAt,
    startChallenge, goTo, soundEnabled, resetProgress, recordSession,
  } = useGameStore()

  const [confirmReset, setConfirmReset] = useState(false)

  const defeatedVillains = VILLAINS.filter(
    v => getVillainProgress(v.id, completedChallenges).defeated
  ).length

  const nextChallenge = useGameStore.getState().getChallenges()
    .find(c => !completedChallenges.includes(c.id))

  function handleContinue() {
    if (soundEnabled) playLevelUp()
    recordSession()
    if (nextChallenge) startChallenge(nextChallenge.id)
    else goTo('levelMap')
  }

  const joinDate = joinedAt
    ? new Date(joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-lg mx-auto">

        {/* Avatar + greeting */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1,   opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="text-6xl inline-block mb-4"
          >🤖</motion.div>

          <h1 className="text-4xl font-black mb-1" style={{ fontFamily: 'Exo 2' }}>
            Welcome back,{' '}
            <span className="text-neon-blue neon-text">{username}</span>!
          </h1>
          {joinDate && (
            <p className="text-slate-600 text-xs font-mono mt-1">
              Quest member since {joinDate} · Session #{sessions}
            </p>
          )}
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y:  0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
        >
          {[
            { icon: '🪙', label: 'Coins',          value: coins.toLocaleString(),              color: '#f59e0b' },
            { icon: '⚡', label: 'XP',             value: xp.toLocaleString(),                color: '#00d4ff' },
            { icon: '💾', label: 'Tokens Saved',   value: totalTokensSaved.toLocaleString(),   color: '#10b981' },
            { icon: '🔥', label: 'Day Streak',     value: streak,                              color: '#ef4444' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + i * 0.06 }}
              className="card p-4 text-center"
              style={{ borderColor: s.color + '22' }}
            >
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-black text-lg font-mono" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-slate-600 mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card p-4 mb-4"
        >
          <div className="flex justify-between text-xs font-mono mb-2">
            <span className="text-slate-400">
              📚 {completedChallenges.length}/25 challenges · 👾 {defeatedVillains}/11 villains · 🏅 {badges.length} badges
            </span>
            <span className="text-neon-blue">{Math.round((completedChallenges.length / 25) * 100)}%</span>
          </div>
          <div className="token-bar h-3">
            <motion.div
              className="token-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${(completedChallenges.length / 25) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
              style={{ background: 'linear-gradient(90deg, #0284c7, #a855f7)' }}
            />
          </div>
          {nextChallenge && (
            <p className="text-xs text-slate-500 font-mono mt-2">
              Next up: <span className="text-neon-purple">{nextChallenge.title}</span>
              <span className="text-slate-600"> · Level {nextChallenge.level} · {nextChallenge.difficulty}</span>
            </p>
          )}
          {!nextChallenge && (
            <p className="text-xs text-neon-green font-mono mt-2">🏆 All 25 challenges complete!</p>
          )}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3 flex-col sm:flex-row mb-4"
        >
          <button className="btn-primary flex-1 text-base py-4" onClick={handleContinue}>
            ⚡ {nextChallenge ? 'Continue Quest' : 'View Level Map'}
          </button>
          <button
            className="btn-neon px-5"
            onClick={() => { if (soundEnabled) playClick(); goTo('levelMap') }}
          >
            🗺 Map
          </button>
          <button
            className="btn-neon px-5"
            onClick={() => { if (soundEnabled) playClick(); goTo('villains') }}
            style={{ borderColor: '#ef4444', color: '#ef4444' }}
          >
            👾 Villains
          </button>
        </motion.div>

        {/* Reset / danger zone */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-center"
        >
          <AnimatePresence>
            {!confirmReset ? (
              <motion.button
                key="reset-prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmReset(true)}
                className="text-xs text-slate-700 hover:text-neon-red transition-colors font-mono underline underline-offset-2"
              >
                Start fresh (reset all progress)
              </motion.button>
            ) : (
              <motion.div
                key="reset-confirm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="card p-4 border-neon-red/30 bg-red-900/10 text-center space-y-3"
              >
                <p className="text-sm text-slate-300">
                  ⚠️ This will wipe all coins, XP, badges, and challenge progress.
                  <br />
                  <span className="text-slate-500 text-xs">Your name <strong>{username}</strong> will be kept.</span>
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    className="btn-neon border-neon-red text-neon-red text-xs px-4 py-2"
                    onClick={() => { resetProgress(); setConfirmReset(false) }}
                  >
                    Yes, reset everything
                  </button>
                  <button
                    className="btn-neon text-xs px-4 py-2"
                    onClick={() => setConfirmReset(false)}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </motion.div>
  )
}

// ── First-time landing screen ───────────────────────────────────────────────
const stats = [
  { value: '25',  label: 'Challenges' },
  { value: '4',   label: 'Game Modes' },
  { value: '11',  label: 'Villains'   },
  { value: '∞',   label: 'Replayable' },
]

function FirstTimeLanding() {
  const { goTo, startChallenge, soundEnabled } = useGameStore()

  function handleStart() {
    if (soundEnabled) playLevelUp()
    goTo('username')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12"
    >
      <div className="text-center max-w-2xl mx-auto mb-16">
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ display: 'inline-block' }}
          className="text-7xl mb-6"
        >🤖</motion.div>

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="font-black text-5xl sm:text-7xl tracking-tight mb-4"
          style={{ fontFamily: 'Exo 2' }}
        >
          <span className="text-neon-blue neon-text-lg">TOKEN</span>
          <span className="text-neon-purple" style={{ textShadow: '0 0 30px #a855f7' }}> QUEST</span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-lg sm:text-xl max-w-md mx-auto leading-relaxed mb-8"
        >
          Defeat token waste. Master AI prompts.
          <br />
          <span className="text-neon-blue/70">Earn coins, badges, and XP.</span>
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button className="btn-primary text-lg px-8 py-4" onClick={handleStart}>
            ⚡ Start Playing — Free
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-slate-600 mt-4"
        >
          No login · No API keys · 100% client-side · Open source
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-4 gap-4 w-full max-w-xl mx-auto mb-16"
      >
        {stats.map((s, i) => (
          <div key={i} className="card p-4 text-center">
            <div className="text-2xl font-black text-neon-blue font-mono">{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mx-auto">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.08 }}
            className="card p-5 flex items-start gap-4"
          >
            <span className="text-3xl">{f.icon}</span>
            <div>
              <h3 className="font-bold text-slate-200 mb-1">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ── Root export: decides which to show ─────────────────────────────────────
export default function LandingScreen() {
  const { username } = useGameStore()
  return username ? <WelcomeBack /> : <FirstTimeLanding />
}
