/**
 * CertificationScreen.jsx
 * Shows all three certification tiers:
 *  - Earned: card with "View Certificate" button
 *  - In Progress: progress bar toward next unlock
 *  - Locked: greyed-out requirements
 */
import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/gameStore.js'
import { CERT_TIERS, getNextTier } from '../../data/certifications.js'
import { loadArchive } from '../../utils/storage.js'
import CertBadge from '../ui/CertBadge.jsx'

function progressTowardTier(tier, completedCount, avgScore) {
  if (tier.id === 'token_saver') {
    return { pct: Math.min(100, Math.round((completedCount / 5) * 100)), label: `${completedCount}/5 challenges` }
  }
  if (tier.id === 'prompt_specialist') {
    const challengePct = Math.min(100, Math.round((completedCount / 15) * 100))
    const scorePct     = Math.min(100, Math.round((avgScore / 60) * 100))
    return {
      pct:   Math.round((challengePct + scorePct) / 2),
      label: `${completedCount}/15 challenges · avg ${avgScore}% (need 60%)`,
    }
  }
  // ai_optimization_professional
  const challengePct = Math.min(100, Math.round((completedCount / 25) * 100))
  const scorePct     = Math.min(100, Math.round((avgScore / 75) * 100))
  return {
    pct:   Math.round((challengePct + scorePct) / 2),
    label: `${completedCount}/25 challenges · avg ${avgScore}% (need 75%)`,
  }
}

export default function CertificationScreen() {
  const {
    goTo, viewCertificate,
    completedChallenges, certifications = [],
  } = useGameStore()

  // Compute live avg score from archive
  const avgScore = useMemo(() => {
    const { attempts } = loadArchive()
    if (!attempts.length) return 0
    return Math.round(attempts.reduce((s, a) => s + (a.totalScore ?? 0), 0) / attempts.length)
  }, [])

  const completedCount = completedChallenges.length
  const earnedIds      = new Set(certifications.map(c => c.tierId))
  const nextTier       = getNextTier(certifications)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="relative z-10 min-h-screen px-4 py-8 max-w-2xl mx-auto"
    >
      {/* Back */}
      <button
        onClick={() => goTo('levelMap')}
        className="text-slate-500 hover:text-neon-blue text-sm mb-6 flex items-center gap-1 transition-colors"
      >
        ← Level Map
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-100 mb-1" style={{ fontFamily: 'Exo 2' }}>
          🎓 Certifications
        </h1>
        <p className="text-slate-500 text-sm font-mono">
          Complete challenges to earn recognised training certificates.
        </p>
      </div>

      {/* Tier cards */}
      <div className="space-y-4">
        {CERT_TIERS.map((tier, i) => {
          const earned = earnedIds.has(tier.id)
          const isNext = !earned && nextTier?.id === tier.id
          const prog   = !earned ? progressTowardTier(tier, completedCount, avgScore) : null
          const earnedRecord = certifications.find(c => c.tierId === tier.id)

          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card p-5 overflow-hidden relative"
              style={{
                borderColor: earned || isNext ? tier.borderColor : 'rgba(51,65,85,0.5)',
                background:  earned ? tier.bgColor : isNext ? tier.bgColor + '88' : 'rgba(15,23,42,0.4)',
                opacity:     !earned && !isNext ? 0.55 : 1,
              }}
            >
              {/* Tier watermark */}
              <div
                className="absolute -right-3 -top-3 text-7xl pointer-events-none select-none"
                style={{ opacity: earned ? 0.12 : 0.05 }}
              >
                {tier.emoji}
              </div>

              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  {/* Level label */}
                  <div className="text-xs font-mono uppercase tracking-widest text-slate-600 mb-1">
                    Level {tier.level} Certification
                  </div>

                  {/* Name + badge */}
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xl">{tier.emoji}</span>
                    <h2 className="font-black text-lg" style={{ fontFamily: 'Exo 2', color: earned ? tier.color : '#94a3b8' }}>
                      {tier.name}
                    </h2>
                    {earned && (
                      <span
                        className="text-xs font-mono font-bold px-2 py-0.5 rounded-full border"
                        style={{ color: tier.color, borderColor: tier.borderColor }}
                      >
                        ✓ EARNED
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 font-mono mb-2">{tier.subtitle}</p>
                  <p className="text-xs text-slate-600 font-mono">{tier.detail}</p>

                  {/* Requirement chip */}
                  <div className="mt-2 text-xs font-mono text-slate-500">
                    📋 {tier.requirement}
                  </div>

                  {/* Date earned */}
                  {earnedRecord && (
                    <div className="mt-1 text-xs font-mono" style={{ color: tier.color }}>
                      🗓 Earned {new Date(earnedRecord.earnedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {' · '}Score: {earnedRecord.avgScore}%
                      {' · '}Challenges: {earnedRecord.completedCount}
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="shrink-0 flex flex-col gap-2">
                  {earned ? (
                    <button
                      className="btn-neon text-xs px-4 py-2"
                      style={{ borderColor: tier.color, color: tier.color }}
                      onClick={() => viewCertificate(earnedRecord)}
                    >
                      🖨 View Certificate
                    </button>
                  ) : isNext ? (
                    <button
                      className="btn-primary text-xs px-4 py-2"
                      onClick={() => goTo('game')}
                    >
                      ⚡ Keep Playing
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-slate-700">🔒 Locked</span>
                  )}
                </div>
              </div>

              {/* In-progress bar */}
              {isNext && prog && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-500">{prog.label}</span>
                    <span style={{ color: tier.color }}>{prog.pct}%</span>
                  </div>
                  <div className="token-bar h-2">
                    <motion.div
                      className="token-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${prog.pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      style={{ background: `linear-gradient(90deg, ${tier.color}88, ${tier.color})` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Footer CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 flex gap-3"
      >
        <button className="btn-primary flex-1" onClick={() => goTo('game')}>
          ⚡ Continue Training
        </button>
        <button className="btn-neon px-4" onClick={() => goTo('leaderboard')}>
          🏆 Leaderboard
        </button>
      </motion.div>
    </motion.div>
  )
}
