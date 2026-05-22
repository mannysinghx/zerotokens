import { motion } from 'framer-motion'
import useGameStore from '../../store/gameStore.js'

const cardVariants = {
  hidden:  { opacity: 0, y: 32 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, type: 'spring', stiffness: 160, damping: 18 } }),
}

export default function UserTypeScreen() {
  const { goTo } = useGameStore()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12"
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-3"
      >
        <h1
          className="text-4xl font-black neon-text text-neon-blue"
          style={{ fontFamily: 'Exo 2' }}
        >
          TOKEN<span className="text-neon-purple">QUEST</span>
        </h1>
        <p className="text-slate-500 text-sm font-mono mt-1 tracking-widest uppercase">
          zerotokens.ai
        </p>
      </motion.div>

      {/* Animated robot */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="text-6xl mb-8 select-none"
      >
        🤖
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-slate-400 font-mono text-sm mb-8 text-center"
      >
        How are you playing today?
      </motion.p>

      {/* Two cards */}
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl">
        {/* Company Employee */}
        <motion.button
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(0,212,255,0.2)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => goTo('companyLogin')}
          className="card flex-1 flex flex-col items-center text-center p-8 cursor-pointer group"
          style={{ minHeight: '220px' }}
        >
          <span className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200 block">
            🏢
          </span>
          <h2
            className="text-xl font-black text-neon-blue mb-2"
            style={{ fontFamily: 'Exo 2' }}
          >
            Company Employee
          </h2>
          <p className="text-slate-400 text-sm font-mono leading-relaxed mb-6 flex-1">
            Your company has subscribed to Token Quest. Log in with your work email.
          </p>
          <span className="btn-primary w-full text-sm py-3">
            Log in with work email
          </span>
        </motion.button>

        {/* Individual Learner */}
        <motion.button
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(168,85,247,0.2)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => goTo('individualSignup')}
          className="card flex-1 flex flex-col items-center text-center p-8 cursor-pointer group"
          style={{ minHeight: '220px', borderColor: 'rgba(168,85,247,0.2)' }}
        >
          <span className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200 block">
            🎮
          </span>
          <h2
            className="text-xl font-black text-neon-purple mb-2"
            style={{ fontFamily: 'Exo 2' }}
          >
            Individual Learner
          </h2>
          <p className="text-slate-400 text-sm font-mono leading-relaxed mb-6 flex-1">
            Learn AI prompt optimisation at your own pace. Free forever.
          </p>
          <span className="btn-neon w-full text-sm py-3" style={{ borderColor: 'var(--neon-purple)', color: 'var(--neon-purple)' }}>
            Create free account
          </span>
        </motion.button>
      </div>

      {/* ── Arcade game panel ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="w-full max-w-2xl mt-6"
      >
        <div
          className="relative overflow-hidden rounded-2xl border p-5"
          style={{
            borderColor: '#f59e0b55',
            background: 'linear-gradient(135deg, #0d0d22 0%, #130d1f 100%)',
            boxShadow: '0 0 36px #f59e0b14',
          }}
        >
          {/* BG glow */}
          <div
            className="absolute right-0 top-0 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, #f59e0b0a 0%, transparent 70%)', transform: 'translate(30%,-30%)' }}
          />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Left */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#00ff88,#00ccff)', color: '#000' }}>
                  FREE
                </span>
                <span className="text-xs font-mono text-slate-500 border border-slate-800 px-2 py-0.5 rounded-full">
                  No Login · K–12
                </span>
              </div>

              <h3
                className="text-xl sm:text-2xl font-black text-white mb-1"
                style={{ fontFamily: 'Exo 2', textShadow: '0 0 20px #f59e0b55' }}
              >
                ⚡ Token Wars — Arcade Game
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3 max-w-sm">
                A 3-D space battle where{' '}
                <span className="text-yellow-400 font-semibold">AI models try to drain your token budget</span>.
                Slash them with your Prompt Sword and fire Token Beams!
              </p>

              {/* Enemy chips */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  { label: 'Token Drainer',   color: '#ff4455' },
                  { label: 'Hallucinator',    color: '#ff8800' },
                  { label: 'Context Bloater', color: '#9933ff' },
                  { label: 'MAX_TOKENS',      color: '#ff0066' },
                ].map(e => (
                  <span
                    key={e.label}
                    className="text-xs font-mono px-2 py-0.5 rounded"
                    style={{ background: e.color + '1a', color: e.color, border: `1px solid ${e.color}44` }}
                  >
                    {e.label}
                  </span>
                ))}
              </div>

              <div className="text-xs text-slate-600 font-mono">
                🌟 Token Pals (K–5) &nbsp;·&nbsp; ⚡ Token Master (6–12)
              </div>
            </div>

            {/* CTA */}
            <div className="shrink-0 w-full sm:w-auto">
              <a
                href="/arcade"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-transform hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(90deg, #f59e0b, #f97316)',
                  color: '#000',
                  boxShadow: '0 0 20px #f59e0b44',
                  fontFamily: 'Exo 2',
                }}
              >
                ⚔ Play Free Now
              </a>
              <p className="text-xs text-slate-600 font-mono text-center mt-1.5">Students · always free</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-slate-700 text-xs font-mono mt-6 text-center"
      >
        Master AI prompts · Save tokens · Climb the leaderboard
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85 }}
        className="text-xs font-mono mt-3 text-center"
      >
        <a
          href="/about"
          className="font-black transition-opacity hover:opacity-75"
          style={{ color: '#a855f7', fontFamily: 'Exo 2', textShadow: '0 0 14px #a855f766', fontSize: '0.8rem', letterSpacing: '0.04em' }}
        >
          About Token Quest →
        </a>
      </motion.p>
    </motion.div>
  )
}
