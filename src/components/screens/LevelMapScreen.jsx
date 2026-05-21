import { motion } from 'framer-motion'
import useGameStore from '../../store/gameStore.js'
import { playClick } from '../../utils/sound.js'
import { VILLAINS, getVillainProgress } from '../../data/villains.js'

const DIFFICULTY_COLOR = {
  beginner:     'text-neon-green',
  intermediate: 'text-neon-blue',
  advanced:     'text-neon-purple',
  expert:       'text-neon-amber',
}

const MODE_ICON = {
  fix_prompt:    '✍️',
  choose_best:   '🎯',
  token_budget:  '⏱️',
}

export default function LevelMapScreen() {
  const { completedChallenges, goTo, startChallenge, startBoss, soundEnabled, coins, getChallenges } = useGameStore()
  const challenges = getChallenges()

  const levelGroups = challenges.reduce((acc, c) => {
    if (!acc[c.level]) acc[c.level] = []
    acc[c.level].push(c)
    return acc
  }, {})

  function isUnlocked(c) {
    if (c.level === 1) return true
    const prevLevel = challenges.filter(x => x.level === c.level - 1)
    return prevLevel.some(x => completedChallenges.includes(x.id))
  }

  const completedCount  = completedChallenges.length
  const totalCount      = challenges.length
  const defeatedVillains = VILLAINS.filter(v => getVillainProgress(v.id, completedChallenges).defeated).length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 min-h-screen px-4 py-8 max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => { playClick(); goTo('landing') }} className="text-slate-500 hover:text-neon-blue text-sm mb-4 flex items-center gap-1 transition-colors">
          ← Back
        </button>
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h1 className="text-3xl font-black text-slate-100" style={{ fontFamily: 'Exo 2' }}>
            🗺 Level Map
          </h1>
          <button
            onClick={() => { playClick(); goTo('villains') }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all hover:scale-105"
            style={{ borderColor: '#ef444455', background: '#ef44440d', color: '#ef4444' }}
          >
            <span>👾</span>
            <span>{defeatedVillains}/{VILLAINS.length} Villains Slain</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 token-bar">
            <div
              className="token-bar-fill"
              style={{
                width: `${(completedCount / totalCount) * 100}%`,
                background: 'linear-gradient(90deg, #0284c7, #a855f7)',
              }}
            />
          </div>
          <span className="text-sm font-mono text-slate-400 whitespace-nowrap">
            {completedCount}/{totalCount} done
          </span>
        </div>
      </div>

      {/* Levels */}
      {Object.entries(levelGroups).map(([level, lvlChallenges]) => (
        <motion.div
          key={level}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: parseInt(level) * 0.05 }}
          className="mb-8"
        >
          <h2 className="text-xs uppercase tracking-widest text-slate-600 mb-3 font-mono">
            Level {level}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lvlChallenges.map(c => {
              const done      = completedChallenges.includes(c.id)
              const unlocked  = isUnlocked(c)

              return (
                <button
                  key={c.id}
                  disabled={!unlocked}
                  onClick={() => {
                    if (!unlocked) return
                    if (soundEnabled) playClick()
                    startChallenge(c.id)
                  }}
                  className={`
                    card p-4 text-left transition-all relative overflow-hidden
                    ${done    ? 'border-neon-blue/40 bg-neon-blue/5'       : ''}
                    ${!done && unlocked  ? 'hover:border-neon-purple/40 cursor-pointer' : ''}
                    ${!unlocked ? 'opacity-40 cursor-not-allowed'          : ''}
                  `}
                >
                  {/* Completed shimmer */}
                  {done && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-blue/5 to-transparent pointer-events-none" />
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{MODE_ICON[c.mode]}</span>
                        <span className={`text-xs font-mono uppercase ${DIFFICULTY_COLOR[c.difficulty]}`}>
                          {c.difficulty}
                        </span>
                        {done && <span className="text-neon-green text-xs">✓</span>}
                        {!unlocked && <span className="text-slate-600 text-xs">🔒</span>}
                      </div>
                      <h3 className="font-bold text-sm text-slate-200 truncate">{c.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {c.originalPrompt.slice(0, 55)}…
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono text-neon-amber">
                        🪙 {c.rewardCoins}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        #{c.id}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </motion.div>
      ))}

      {/* Boss battle button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4"
      >
        <div className="card p-6 border-neon-red/30 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-transparent pointer-events-none" />
          <div className="text-4xl mb-3">🐉</div>
          <h3 className="text-xl font-black text-neon-red mb-2" style={{ fontFamily: 'Exo 2' }}>
            Token Boss Battle
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            5 rounds of advanced challenges. Defeat the boss for massive rewards.
          </p>
          <button
            className="btn-neon border-neon-red text-neon-red hover:shadow-red"
            onClick={() => { if (soundEnabled) playClick(); startBoss() }}
          >
            ⚔️ Challenge the Boss
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
