import { motion } from 'framer-motion'
import useGameStore from '../../store/gameStore.js'
import { playClick } from '../../utils/sound.js'

export default function BadgeShelfScreen() {
  const { badges, totalTokensSaved, combo, bossDefeated, goTo, getBadges, soundEnabled, completedChallenges, streak } = useGameStore()
  const allBadges = getBadges()

  const earned  = allBadges.filter(b => badges.includes(b.id))
  const locked  = allBadges.filter(b => !badges.includes(b.id))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 min-h-screen px-4 py-8 max-w-3xl mx-auto"
    >
      <button onClick={() => { if (soundEnabled) playClick(); goTo('levelMap') }} className="text-slate-500 hover:text-neon-blue text-sm mb-6 flex items-center gap-1 transition-colors">
        ← Back
      </button>

      <h1 className="text-3xl font-black text-slate-100 mb-2" style={{ fontFamily: 'Exo 2' }}>
        🏅 Badge Shelf
      </h1>
      <p className="text-slate-500 text-sm mb-8">
        {earned.length} / {allBadges.length} earned
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { icon: '💾', label: 'Tokens Saved', value: totalTokensSaved.toLocaleString() },
          { icon: '📚', label: 'Challenges',   value: completedChallenges.length },
          { icon: '🔥', label: 'Streak',       value: `${streak} days` },
          { icon: '⚡', label: 'Max Combo',    value: `×${useGameStore.getState().maxCombo || 0}` },
        ].map((s, i) => (
          <div key={i} className="card p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="font-black text-lg text-neon-blue font-mono">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Earned badges */}
      {earned.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs uppercase tracking-widest text-slate-500 font-mono mb-4">Earned</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {earned.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="card p-4 flex items-center gap-3 border-neon-amber/30 bg-neon-amber/5"
              >
                <span className="text-3xl">{b.icon}</span>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-neon-amber truncate">{b.name}</div>
                  <div className="text-xs text-slate-500 leading-tight">{b.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked badges */}
      {locked.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-widest text-slate-500 font-mono mb-4">Locked</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {locked.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="card p-4 flex items-center gap-3 badge-locked"
              >
                <span className="text-3xl grayscale opacity-30">{b.icon}</span>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-slate-600 truncate">{b.name}</div>
                  <div className="text-xs text-slate-700 leading-tight">{b.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {earned.length === 0 && (
        <div className="text-center py-12 text-slate-600">
          <div className="text-4xl mb-3">🔒</div>
          <p>Complete challenges to earn badges!</p>
          <button className="btn-primary mt-4" onClick={() => goTo('levelMap')}>
            Start Playing
          </button>
        </div>
      )}
    </motion.div>
  )
}
