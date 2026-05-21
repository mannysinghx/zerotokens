import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function TokenMeter({ original, optimized }) {
  const saved = Math.max(0, original - optimized)
  const pct   = original > 0 ? Math.round((saved / original) * 100) : 0

  const [displayOrig,  setDisplayOrig]  = useState(0)
  const [displayOptim, setDisplayOptim] = useState(0)

  useEffect(() => {
    // Animate counters
    let frame
    const duration = 800
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setDisplayOrig(Math.round(original * ease))
      setDisplayOptim(Math.round(optimized * ease))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [original, optimized])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono uppercase tracking-widest">
        <span>Token Usage</span>
        {saved > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-neon-green font-bold"
          >
            -{pct}% saved
          </motion.span>
        )}
      </div>

      {/* Original */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Original</span>
          <span className="font-mono text-slate-300">{displayOrig} tokens</span>
        </div>
        <div className="token-bar">
          <motion.div
            className="token-bar-fill"
            style={{ background: 'linear-gradient(90deg, #7f1d1d, #ef4444)' }}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Optimized */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Optimized</span>
          <span className="font-mono text-neon-blue">{displayOptim} tokens</span>
        </div>
        <div className="token-bar">
          <motion.div
            className="token-bar-fill"
            style={{ background: 'linear-gradient(90deg, #0284c7, #00d4ff)' }}
            initial={{ width: '100%' }}
            animate={{ width: original > 0 ? `${(optimized / original) * 100}%` : '0%' }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
      </div>

      {/* Savings */}
      {saved > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-2 mt-1"
        >
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neon-green/40 to-transparent" />
          <span className="text-neon-green font-bold font-mono text-sm">
            ✦ {saved} tokens saved
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neon-green/40 to-transparent" />
        </motion.div>
      )}
    </div>
  )
}
