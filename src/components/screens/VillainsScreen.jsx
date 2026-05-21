import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/gameStore.js'
import { VILLAINS, POWERS, getVillainProgress } from '../../data/villains.js'
import { playClick } from '../../utils/sound.js'

function VillainCard({ villain, completedChallenges, onHunt, index }) {
  const { done, total, defeated } = getVillainProgress(villain.id, completedChallenges)
  const pct = total > 0 ? (done / total) * 100 : 0
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative overflow-hidden rounded-2xl border p-5 cursor-pointer transition-all duration-200
        ${defeated
          ? 'border-neon-green/30 bg-neon-green/5'
          : 'border-white/8 bg-bg-card hover:border-opacity-50'
        }
      `}
      style={hovered && !defeated ? { borderColor: villain.color + '55', boxShadow: `0 0 20px ${villain.color}20` } : {}}
      onClick={() => !defeated && onHunt(villain.challengeIds[done] ?? villain.challengeIds[0])}
    >
      {/* Defeated overlay */}
      {defeated && (
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: -8 }}
          className="absolute top-3 right-3 z-10"
        >
          <span
            className="text-xs font-black px-2 py-0.5 rounded border-2 tracking-widest"
            style={{ color: '#10b981', borderColor: '#10b981', textShadow: '0 0 10px #10b981' }}
          >
            SLAIN
          </span>
        </motion.div>
      )}

      {/* Background glow blob */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 pointer-events-none blur-xl"
        style={{ background: villain.color }}
      />

      <div className="flex items-start gap-4">
        {/* Emoji */}
        <motion.span
          animate={defeated ? {} : { y: [0, -4, 0] }}
          transition={{ duration: 2.5 + index * 0.3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-4xl shrink-0 select-none"
          style={defeated ? { filter: 'grayscale(0.6) brightness(0.6)' } : {}}
        >
          {villain.emoji}
        </motion.span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h3
              className="font-black text-base leading-tight"
              style={{ color: defeated ? '#4b5563' : villain.color, fontFamily: 'Exo 2' }}
            >
              {villain.name}
            </h3>
          </div>

          <p className="text-xs text-slate-500 font-mono mb-1">{villain.waste}</p>

          <p className="text-xs text-slate-400 italic mb-3 leading-relaxed hidden sm:block">
            {villain.tagline}
          </p>

          {/* HP / Progress bar */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-500">
                {defeated ? '☠ Defeated' : `${done}/${total} challenges`}
              </span>
              <span style={{ color: defeated ? '#10b981' : villain.color }}>
                {defeated ? '100%' : `${Math.round(pct)}% damage dealt`}
              </span>
            </div>
            <div className="token-bar h-2">
              <motion.div
                className="token-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.06 }}
                style={{ background: defeated ? '#10b981' : `linear-gradient(90deg, ${villain.color}88, ${villain.color})` }}
              />
            </div>
          </div>

          {/* Power unlock hint */}
          {!defeated && villain.power && (
            <p className="text-xs text-slate-600 mt-2 font-mono">
              🔒 Defeat to unlock: <span style={{ color: villain.color }} className="font-bold">{POWERS.find(p => p.id === villain.power)?.name}</span>
            </p>
          )}
          {defeated && villain.power && (
            <p className="text-xs mt-2 font-mono" style={{ color: '#10b981' }}>
              ✓ Unlocked: <span className="font-bold">{POWERS.find(p => p.id === villain.power)?.name}</span>
            </p>
          )}
        </div>
      </div>

      {/* Hunt button */}
      {!defeated && (
        <motion.div
          animate={{ opacity: hovered ? 1 : 0 }}
          className="absolute bottom-3 right-3"
        >
          <span
            className="text-xs font-bold px-2 py-1 rounded-lg border font-mono uppercase tracking-wider"
            style={{ color: villain.color, borderColor: villain.color + '66', background: villain.color + '11' }}
          >
            ⚔ Hunt
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}

function PowerCard({ power, isUnlocked, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04 }}
      className={`
        relative rounded-xl border p-4 overflow-hidden transition-all
        ${isUnlocked
          ? 'border-opacity-40 bg-bg-card'
          : 'border-white/5 bg-bg-secondary opacity-40'
        }
      `}
      style={isUnlocked ? { borderColor: power.color + '44', boxShadow: `0 0 15px ${power.color}15` } : {}}
    >
      {isUnlocked && (
        <div
          className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full opacity-10 blur-lg pointer-events-none"
          style={{ background: power.color }}
        />
      )}

      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0" style={isUnlocked ? {} : { filter: 'grayscale(1)' }}>
          {power.emoji}
        </span>
        <div className="min-w-0">
          <div className="font-bold text-sm" style={{ color: isUnlocked ? power.color : '#374151', fontFamily: 'Exo 2' }}>
            {power.name}
          </div>
          <div className="text-xs text-slate-600 font-mono mb-1">{power.concept}</div>
          {isUnlocked && (
            <p className="text-xs text-slate-400 leading-relaxed">{power.description}</p>
          )}
          {!isUnlocked && power.unlockedBy && (
            <p className="text-xs text-slate-700 font-mono">
              🔒 Defeat {VILLAINS.find(v => v.id === power.unlockedBy)?.name.replace('The ', '')}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function VillainsScreen() {
  const { completedChallenges, goTo, startChallenge, soundEnabled } = useGameStore()
  const [tab, setTab] = useState('villains') // 'villains' | 'arsenal'

  const defeatedCount = VILLAINS.filter(v => {
    const { defeated } = getVillainProgress(v.id, completedChallenges)
    return defeated
  }).length

  const unlockedPowerIds = new Set([
    ...VILLAINS.filter(v => {
      const { defeated } = getVillainProgress(v.id, completedChallenges)
      return defeated && v.power
    }).map(v => v.power),
    ...POWERS.filter(p => p.alwaysUnlocked).map(p => p.id),
  ])

  function handleHunt(challengeId) {
    if (soundEnabled) playClick()
    startChallenge(challengeId)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 min-h-screen px-4 py-8 max-w-4xl mx-auto"
    >
      {/* Back */}
      <button
        onClick={() => { if (soundEnabled) playClick(); goTo('levelMap') }}
        className="text-slate-500 hover:text-neon-blue text-sm mb-6 flex items-center gap-1 transition-colors"
      >
        ← Back
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-2 leading-tight" style={{ fontFamily: 'Exo 2' }}>
          <span className="text-neon-red" style={{ textShadow: '0 0 20px #ef444466' }}>Token</span>
          <span className="text-slate-200"> Villains</span>
        </h1>
        <p className="text-slate-400 max-w-xl leading-relaxed">
          These 11 villains haunt AI systems everywhere — draining budgets, bloating contexts, and wasting compute.
          Complete their challenge hunts to slay them and unlock your <span className="text-neon-purple font-bold">Zero-Waste Arsenal</span>.
        </p>

        {/* Progress */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚔️</span>
            <div>
              <div className="font-black text-xl text-neon-amber font-mono">{defeatedCount}<span className="text-slate-600 text-base">/{VILLAINS.length}</span></div>
              <div className="text-xs text-slate-500">Villains slain</div>
            </div>
          </div>
          <div className="flex-1 token-bar h-3">
            <motion.div
              className="token-bar-fill"
              animate={{ width: `${(defeatedCount / VILLAINS.length) * 100}%` }}
              style={{ background: 'linear-gradient(90deg, #ef4444, #f59e0b)' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔓</span>
            <div>
              <div className="font-black text-xl text-neon-purple font-mono">{unlockedPowerIds.size}<span className="text-slate-600 text-base">/{POWERS.length}</span></div>
              <div className="text-xs text-slate-500">Powers unlocked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6 p-1 bg-bg-secondary rounded-xl w-fit">
        {[
          { id: 'villains', label: '👾 Villains', count: `${defeatedCount}/${VILLAINS.length}` },
          { id: 'arsenal',  label: '⚡ Zero-Waste Arsenal', count: `${unlockedPowerIds.size}/${POWERS.length}` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`
              px-4 py-2 rounded-lg text-sm font-bold transition-all
              ${tab === t.id
                ? 'bg-bg-elevated text-slate-100 shadow-lg'
                : 'text-slate-500 hover:text-slate-300'
              }
            `}
          >
            {t.label}
            <span className="ml-2 text-xs text-slate-500 font-mono">{t.count}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'villains' && (
          <motion.div
            key="villains"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {VILLAINS.map((v, i) => (
              <VillainCard
                key={v.id}
                villain={v}
                completedChallenges={completedChallenges}
                onHunt={handleHunt}
                index={i}
              />
            ))}
          </motion.div>
        )}

        {tab === 'arsenal' && (
          <motion.div
            key="arsenal"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            {/* Arsenal intro */}
            <div className="card p-5 mb-6 border-neon-purple/20 bg-neon-purple/5">
              <div className="flex items-start gap-4">
                <span className="text-4xl shrink-0">🛡️</span>
                <div>
                  <h2 className="font-black text-lg text-neon-purple mb-1" style={{ fontFamily: 'Exo 2' }}>
                    Zero-Waste Architecture
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Each power is a real AI systems pattern that counters a villain's waste behavior.
                    Defeat villains to unlock their countermeasure. Two powers — <strong className="text-slate-300">The Watcher</strong> and <strong className="text-slate-300">ROI Ranger</strong> — are always active.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {POWERS.map((p, i) => (
                <PowerCard
                  key={p.id}
                  power={p}
                  isUnlocked={unlockedPowerIds.has(p.id)}
                  index={i}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
