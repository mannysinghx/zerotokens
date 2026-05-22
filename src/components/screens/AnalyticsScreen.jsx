/**
 * AnalyticsScreen.jsx
 * Full player analytics dashboard.
 * Data sourced from the hidden archive (localStorage) — nothing leaves the device.
 */
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import useGameStore from '../../store/gameStore.js'
import { computeAnalytics } from '../../utils/analytics.js'
import { lifetimeSavingsProjection } from '../../utils/costCalculator.js'
import { getEloRank } from '../../utils/elo.js'
import SkillRadar from '../ui/SkillRadar.jsx'
import EloChip from '../ui/EloChip.jsx'

// ── Helper sub-components ─────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color = '#00d4ff', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y:  0 }}
      transition={{ delay }}
      className="card p-4 text-center"
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-black font-mono" style={{ color }}>{value}</div>
      <div className="text-xs text-slate-500 font-mono">{label}</div>
      {sub && <div className="text-xs text-slate-600 font-mono mt-0.5">{sub}</div>}
    </motion.div>
  )
}

function DNABar({ label, value, color }) {
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
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

const GRADE_COLORS = { S: '#00d4ff', A: '#10b981', B: '#a855f7', C: '#f59e0b', D: '#ef4444' }

function GradeDonut({ dist, total }) {
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-slate-600 text-sm font-mono">
        No data yet
      </div>
    )
  }
  return (
    <div className="flex gap-2 flex-wrap">
      {Object.entries(dist).map(([grade, count]) => (
        <div key={grade} className="flex-1 min-w-[3rem] text-center">
          <div
            className="text-lg font-black font-mono"
            style={{ color: GRADE_COLORS[grade] }}
          >
            {grade}
          </div>
          <div className="text-xs font-mono text-slate-400">{count}</div>
          <div className="text-xs font-mono text-slate-600">
            {total ? Math.round((count / total) * 100) : 0}%
          </div>
        </div>
      ))}
    </div>
  )
}

function MiniSparkline({ data }) {
  if (!data || data.length < 2) {
    return (
      <div className="flex items-center justify-center h-14 text-slate-600 text-xs font-mono">
        Play more challenges to see your curve
      </div>
    )
  }

  const W = 280, H = 56
  const max  = Math.max(...data.map(d => d.score), 1)
  const xStep = W / (data.length - 1)

  const points = data.map((d, i) => ({
    x: i * xStep,
    y: H - (d.score / max) * (H - 8),
  }))

  const polyline = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area     = `${points[0].x},${H} ` + polyline + ` ${points[points.length - 1].x},${H}`

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#00d4ff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00d4ff" stopOpacity="0"    />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#sparkGrad)" />
      <polyline
        points={polyline}
        fill="none"
        stroke="#00d4ff"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Last dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={3.5}
        fill="#00d4ff"
      />
    </svg>
  )
}

function ModeTable({ modes }) {
  if (!modes || modes.length === 0) {
    return <p className="text-slate-600 text-xs font-mono">No data yet.</p>
  }
  const labels = {
    fix_prompt:   'Fix Prompt',
    token_budget: 'Token Budget',
    choose_best:  'Choose Best',
  }
  return (
    <div className="space-y-2">
      {modes.map(m => (
        <div key={m.mode} className="flex justify-between items-center text-sm">
          <span className="text-slate-400 font-mono">{labels[m.mode] ?? m.mode}</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-600 font-mono">{m.count} plays</span>
            <span
              className="font-bold font-mono text-sm"
              style={{
                color: m.avg >= 75 ? '#10b981' : m.avg >= 50 ? '#f59e0b' : '#ef4444',
              }}
            >
              {m.avg}%
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function AnalyticsScreen() {
  const { goTo, playerElo = 1000, totalTokensSaved = 0, xp = 0, combo = 0 } = useGameStore()

  const analytics = useMemo(() => computeAnalytics(), [])
  const projection = useMemo(() => lifetimeSavingsProjection(totalTokensSaved), [totalTokensSaved])
  const rank       = getEloRank(playerElo)

  const {
    radarData,
    gradeDistribution,
    improvementCurve,
    promptDNA,
    modePerformance,
    totalAttempts,
    avgScore,
    bestStreak,
  } = analytics

  const totalGrades = Object.values(gradeDistribution).reduce((s, v) => s + v, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y:  0 }}
      exit={{    opacity: 0         }}
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
      <div className="mb-6">
        <h1
          className="text-3xl font-black text-slate-100 mb-1"
          style={{ fontFamily: 'Exo 2' }}
        >
          📊 Analytics
        </h1>
        <p className="text-slate-500 text-sm font-mono">
          Your skill breakdown — all data stays on this device.
        </p>
      </div>

      {/* Elo card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y:  0 }}
        transition={{ delay: 0.05 }}
        className="card p-5 mb-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500 font-mono mb-2">
              Prompt Engineering Elo
            </div>
            <EloChip elo={playerElo} size="lg" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-black font-mono" style={{ color: rank.color }}>
              {playerElo}
            </div>
            <div className="text-xs text-slate-500 font-mono">rating points</div>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <StatCard icon="🎯" label="Attempts"    value={totalAttempts}   color="#00d4ff" delay={0.1} />
        <StatCard icon="📈" label="Avg Score"   value={`${avgScore}%`}  color="#a855f7" delay={0.15} />
        <StatCard icon="🔥" label="Best Streak" value={bestStreak}      color="#f59e0b" delay={0.2} />
        <StatCard icon="⚡" label="Total XP"    value={xp}              color="#10b981" delay={0.25} />
      </div>

      {/* Radar + Grade grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4"
      >
        {/* Radar */}
        <div className="card p-5">
          <h3 className="text-xs uppercase tracking-widest text-slate-500 font-mono mb-4">
            Skill Profile
          </h3>
          <div className="flex justify-center">
            <SkillRadar data={radarData} size={220} color="#00d4ff" />
          </div>
        </div>

        {/* Grade distribution */}
        <div className="card p-5">
          <h3 className="text-xs uppercase tracking-widest text-slate-500 font-mono mb-4">
            Grade Distribution
          </h3>
          <GradeDonut dist={gradeDistribution} total={totalGrades} />

          <hr className="border-slate-800 my-4" />

          <h3 className="text-xs uppercase tracking-widest text-slate-500 font-mono mb-3">
            By Mode
          </h3>
          <ModeTable modes={modePerformance} />
        </div>
      </motion.div>

      {/* Improvement curve */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="card p-5 mb-4"
      >
        <h3 className="text-xs uppercase tracking-widest text-slate-500 font-mono mb-3">
          Score Over Time
        </h3>
        <MiniSparkline data={improvementCurve} />
      </motion.div>

      {/* Prompt DNA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="card p-5 mb-4 space-y-3"
      >
        <h3 className="text-xs uppercase tracking-widest text-slate-500 font-mono mb-1">
          🧬 Prompt DNA
        </h3>
        <p className="text-xs text-slate-600 font-mono -mt-1 mb-2">
          How often your submissions include these quality signals.
        </p>
        <DNABar label="Action Verb"       value={promptDNA.actionVerb}       color="#00d4ff" />
        <DNABar label="Output Format"     value={promptDNA.outputFormat}     color="#a855f7" />
        <DNABar label="Tone Spec"         value={promptDNA.tone}             color="#10b981" />
        <DNABar label="Length Constraint" value={promptDNA.lengthConstraint} color="#f59e0b" />
      </motion.div>

      {/* Cost savings */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="card p-5 mb-6 border-neon-green/20 bg-green-900/5"
      >
        <h3 className="text-xs uppercase tracking-widest text-neon-green font-mono mb-3">
          💰 Lifetime Savings (GPT-4.1 estimate)
        </h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Saved Today',    val: projection.formatted.perDay   },
            { label: 'Per Month',      val: projection.formatted.perMonth },
            { label: 'Per Year',       val: projection.formatted.perYear  },
          ].map(({ label, val }) => (
            <div key={label}>
              <div className="text-lg font-black font-mono text-neon-green">{val}</div>
              <div className="text-xs text-slate-500 font-mono">{label}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-700 font-mono mt-3">
          Based on {totalTokensSaved.toLocaleString()} tokens saved · $0.002/1K tokens (GPT-4.1)
        </p>
      </motion.div>

      {/* Footer CTA */}
      <div className="flex gap-3">
        <button className="btn-primary flex-1" onClick={() => goTo('game')}>
          ⚡ Play Now
        </button>
        <button className="btn-neon px-4" onClick={() => goTo('levelMap')}>
          🗺 Map
        </button>
      </div>
    </motion.div>
  )
}
