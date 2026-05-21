import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/gameStore.js'
import ScoreRing from '../ui/ScoreRing.jsx'
import TokenMeter from '../ui/TokenMeter.jsx'
import CoinBurst from '../ui/CoinBurst.jsx'
import RobotGuide from '../ui/RobotGuide.jsx'
import { playLevelUp, playSuccess, playError } from '../../utils/sound.js'
import { VILLAINS, POWERS, getVillainProgress } from '../../data/villains.js'

const GRADE_MESSAGES = {
  S: ['PERFECT! 🌟', 'Absolute mastery!', "You're an AI whisperer!"],
  A: ['Excellent! ⚡', 'Very well done!', 'Sharp as a laser!'],
  B: ['Good job! ✨', 'Solid optimization!', 'Keep it up!'],
  C: ['Not bad!', 'Room to improve.', 'Practice makes perfect.'],
  D: ['Keep trying! 💪', 'Every miss is a lesson.', "You'll get it next time!"],
}

function getMessage(grade) {
  const msgs = GRADE_MESSAGES[grade] || GRADE_MESSAGES['C']
  return msgs[Math.floor(Math.random() * msgs.length)]
}

function ScoreBar({ label, value, color, delay = 0 }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400 font-mono">{label}</span>
        <span className="font-bold font-mono" style={{ color }}>{value}%</span>
      </div>
      <div className="token-bar">
        <motion.div
          className="token-bar-fill"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay }}
        />
      </div>
    </div>
  )
}

export default function ResultsScreen() {
  const {
    lastScore, newBadges, combo, nextChallenge, goTo,
    soundEnabled, getBadges, challenge,
  } = useGameStore()

  // Freeze all display data in local state on mount. When the user clicks
  // "Next Challenge", nextChallenge() clears lastScore/challenge/newBadges in
  // the store while AnimatePresence still holds this component alive for its
  // exit animation — without these snapshots the component would crash or
  // re-navigate mid-animation.
  const [score]          = useState(lastScore)
  const [frozenBadges]   = useState(newBadges)
  const [frozenChallenge]= useState(challenge)
  const [frozenCompleted]= useState(() => useGameStore.getState().completedChallenges)

  if (!score) {
    goTo('levelMap')
    return null
  }

  const robotExpr = score.grade === 'S' || score.grade === 'A' ? 'excited'
    : score.grade === 'B' ? 'happy'
    : score.grade === 'D' ? 'warning'
    : 'idle'

  const allBadges = getBadges()
  const unlockedBadgeObjects = frozenBadges.map(id => allBadges.find(b => b.id === id)).filter(Boolean)

  // Villain progress for this challenge
  const villain = frozenChallenge?.villain ? VILLAINS.find(v => v.id === frozenChallenge.villain) : null
  const villainProgress = villain ? getVillainProgress(villain.id, frozenCompleted) : null
  const villainJustDefeated = villainProgress?.defeated && score.totalScore >= 40

  useEffect(() => {
    if (!soundEnabled) return
    if (score.grade === 'S') playLevelUp()
    else if (score.grade === 'A' || score.grade === 'B') playSuccess()
    else playError()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="relative z-10 min-h-screen px-4 py-8 max-w-2xl mx-auto"
    >
      <CoinBurst trigger score={score.totalScore} />

      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="text-5xl mb-3"
        >
          {score.grade === 'S' ? '🏆' : score.grade === 'A' ? '⭐' : score.grade === 'B' ? '✨' : score.grade === 'C' ? '👍' : '💪'}
        </motion.div>
        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-black mb-2"
          style={{ fontFamily: 'Exo 2' }}
        >
          {getMessage(score.grade)}
        </motion.h1>
        {frozenChallenge && (
          <p className="text-slate-500 text-sm">{frozenChallenge.title}</p>
        )}
      </div>

      {/* Main score card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="card p-6 mb-4"
      >
        <div className="grid grid-cols-3 gap-6 items-center">
          {/* Ring */}
          <div className="flex justify-center">
            <ScoreRing score={score.totalScore} grade={score.grade} size={110} />
          </div>

          {/* Rewards */}
          <div className="col-span-2 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <RewardChip icon="🪙" label="Coins" value={`+${score.finalCoins ?? score.coins}`} color="amber" />
              <RewardChip icon="⚡" label="XP"    value={`+${score.xp}`}    color="blue"  />
              {score.tokensSaved > 0 && (
                <RewardChip icon="💾" label="Saved" value={`${score.tokensSaved} tokens`} color="green" />
              )}
              {(score.comboBonus ?? 0) > 0 && (
                <RewardChip icon="🔥" label="Combo" value={`+${score.comboBonus}`} color="purple" />
              )}
            </div>
            {combo > 1 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center text-sm font-bold text-neon-purple font-mono"
              >
                ⚡ {combo}× Combo Multiplier!
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Score breakdown */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="card p-5 mb-4 space-y-3"
      >
        <h3 className="text-xs uppercase tracking-widest text-slate-500 font-mono mb-3">Score Breakdown</h3>
        <ScoreBar label="Token Savings (40%)" value={score.savingsScore}    color="#00d4ff" delay={0.3}  />
        <ScoreBar label="Clarity (30%)"       value={score.clarityScore}    color="#a855f7" delay={0.45} />
        <ScoreBar label="Intent (20%)"        value={score.intentScore}     color="#10b981" delay={0.55} />
        <ScoreBar label="Specificity (10%)"   value={score.specificityScore}color="#f59e0b" delay={0.65} />
      </motion.div>

      {/* Token meter */}
      {score.tokensSaved > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="card p-5 mb-4"
        >
          <TokenMeter original={score.originalTokens} optimized={score.optimizedTokens} />
        </motion.div>
      )}

      {/* Robot feedback */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mb-4"
      >
        <RobotGuide
          expression={robotExpr}
          message={
            score.grade === 'S' ? "Outstanding! You saved tokens AND kept full intent. That's mastery." :
            score.grade === 'A' ? "Really solid! Adding a format constraint could push this to S." :
            score.grade === 'B' ? "Good work! Try adding an action verb and output format next time." :
            score.grade === 'C' ? "Getting there! Make sure required concepts are still present." :
            "Don't give up! Check that you kept the key concepts from the original."
          }
          visible
        />
      </motion.div>

      {/* New badges */}
      <AnimatePresence>
        {unlockedBadgeObjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="card p-5 mb-4 border-neon-amber/30 bg-neon-amber/5"
          >
            <h3 className="text-xs uppercase tracking-widest text-neon-amber font-mono mb-3">
              🎉 New Badges Unlocked!
            </h3>
            <div className="flex flex-wrap gap-3">
              {unlockedBadgeObjects.map(b => (
                <motion.div
                  key={b.id}
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 250 }}
                  className="flex items-center gap-2 bg-neon-amber/10 border border-neon-amber/30 rounded-xl px-3 py-2"
                >
                  <span className="text-xl">{b.icon}</span>
                  <div>
                    <div className="font-bold text-sm text-neon-amber">{b.name}</div>
                    <div className="text-xs text-slate-400">{b.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Villain damage card */}
      {villain && frozenChallenge && score.totalScore >= 40 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ delay: 0.65 }}
          className="mb-4"
        >
          <div
            className="card p-4 border-opacity-30 overflow-hidden relative"
            style={{ borderColor: villain.color + '44', background: villain.color + '08' }}
          >
            <div className="absolute -right-4 -top-4 text-6xl opacity-10 pointer-events-none select-none">
              {villain.emoji.split('💥')[0]}
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{villain.emoji.split('💥')[0]}</span>
              <div>
                <div className="text-xs text-slate-500 font-mono uppercase tracking-wider">Villain Hunt</div>
                <div className="font-bold text-sm" style={{ color: villain.color, fontFamily: 'Exo 2' }}>
                  {villainJustDefeated ? `⚔️ ${villain.name} SLAIN!` : `${villain.name}`}
                </div>
              </div>
              {villainJustDefeated && (
                <motion.span
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: -6 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                  className="ml-auto text-xs font-black px-2 py-1 rounded border-2 tracking-widest"
                  style={{ color: '#10b981', borderColor: '#10b981' }}
                >
                  SLAIN
                </motion.span>
              )}
            </div>
            <div className="mb-1 flex justify-between text-xs font-mono">
              <span className="text-slate-500">Damage dealt</span>
              <span style={{ color: villain.color }}>{villainProgress.done}/{villainProgress.total} challenges</span>
            </div>
            <div className="token-bar h-2">
              <motion.div
                className="token-bar-fill"
                initial={{ width: `${((villainProgress.done - 1) / villainProgress.total) * 100}%` }}
                animate={{ width: `${(villainProgress.done / villainProgress.total) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                style={{ background: `linear-gradient(90deg, ${villain.color}88, ${villain.color})` }}
              />
            </div>
            {villainJustDefeated && villain.power && (() => {
              const power = POWERS.find(p => p.id === villain.power)
              return power ? (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-3 flex items-center gap-2 text-xs font-mono"
                >
                  <span className="text-lg">{power.emoji}</span>
                  <span className="text-neon-green font-bold">Power Unlocked: {power.name}</span>
                  <span className="text-slate-500">— {power.concept}</span>
                </motion.div>
              ) : null
            })()}
          </div>
        </motion.div>
      )}

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex gap-3 flex-col sm:flex-row"
      >
        <button className="btn-primary flex-1" onClick={nextChallenge}>
          ⚡ Next Challenge
        </button>
        <button className="btn-neon px-4" onClick={() => goTo('levelMap')}>
          🗺 Level Map
        </button>
        <button
          className="btn-neon px-4"
          onClick={() => goTo('villains')}
          style={{ borderColor: '#ef4444', color: '#ef4444' }}
        >
          👾 Villains
        </button>
      </motion.div>
    </motion.div>
  )
}

function RewardChip({ icon, label, value, color }) {
  const colorMap = {
    amber:  'border-neon-amber/30 bg-neon-amber/5  text-neon-amber',
    blue:   'border-neon-blue/30  bg-neon-blue/5   text-neon-blue',
    green:  'border-neon-green/30 bg-neon-green/5  text-neon-green',
    purple: 'border-neon-purple/30 bg-neon-purple/5 text-neon-purple',
  }
  return (
    <div className={`rounded-xl border p-3 ${colorMap[color]}`}>
      <div className="text-lg">{icon}</div>
      <div className="text-xs text-slate-500 font-mono">{label}</div>
      <div className="font-bold font-mono text-sm">{value}</div>
    </div>
  )
}
