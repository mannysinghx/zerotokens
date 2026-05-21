import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const CIRCUMFERENCE = 2 * Math.PI * 45  // r=45 → ~283

function gradeColor(grade) {
  return { S: '#f59e0b', A: '#00d4ff', B: '#a855f7', C: '#94a3b8', D: '#ef4444' }[grade] || '#94a3b8'
}

export default function ScoreRing({ score = 0, grade = 'C', size = 120 }) {
  const r     = 45
  const cx    = 50
  const strokeWidth = 7
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE
  const color  = gradeColor(grade)

  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ width: size, height: size }} className="relative">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle
            cx={cx} cy={cx} r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Fill */}
          <motion.circle
            cx={cx} cy={cx} r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>

        {/* Centre text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 300 }}
            className={`text-3xl font-black grade-${grade.toLowerCase()}`}
            style={{ fontFamily: 'Exo 2, sans-serif', color }}
          >
            {grade}
          </motion.span>
          <span className="text-xs text-slate-400 font-mono">{score}%</span>
        </div>
      </div>
    </div>
  )
}
