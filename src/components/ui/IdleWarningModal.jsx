/**
 * IdleWarningModal.jsx
 * Shown when the user has been idle for 25 minutes.
 * Counts down 5 minutes (300s → 0) then auto-logout fires.
 *
 * Props:
 *   secondsLeft  — seconds until auto-logout
 *   username     — display name
 *   onKeepAlive  — resets the idle timer
 *   onLogout     — immediate logout
 */
import { motion } from 'framer-motion'

function fmt(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// Colour shifts red as time runs out
function urgencyColor(secs) {
  if (secs <= 60)  return '#ef4444'   // red   — 1 min left
  if (secs <= 120) return '#f59e0b'   // amber — 2 min left
  return '#00d4ff'                    // cyan  — plenty of time
}

export default function IdleWarningModal({ secondsLeft, username, onKeepAlive, onLogout }) {
  const color = urgencyColor(secondsLeft)
  const pct   = (secondsLeft / 300) * 100   // out of 5-min warning window

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4"
         style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className="w-full max-w-sm bg-slate-900 border rounded-2xl p-6 shadow-2xl"
        style={{ borderColor: color + '55' }}
      >
        {/* Icon + title */}
        <div className="text-center mb-5">
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="text-4xl mb-3"
          >⏰</motion.div>
          <h2 className="text-lg font-black text-slate-100" style={{ fontFamily: 'Exo 2' }}>
            Session Expiring Soon
          </h2>
          <p className="text-slate-400 text-xs font-mono mt-1">
            No activity detected for 25 minutes
          </p>
        </div>

        {/* Countdown ring / bar */}
        <div className="mb-5">
          {/* Progress bar */}
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
            <motion.div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${pct}%`, background: color }}
            />
          </div>
          {/* Big countdown number */}
          <div className="text-center">
            <span
              className="text-4xl font-black font-mono tabular-nums"
              style={{ color, textShadow: `0 0 16px ${color}66` }}
            >
              {fmt(secondsLeft)}
            </span>
            <p className="text-slate-500 text-xs font-mono mt-1">
              until automatic log out
            </p>
          </div>
        </div>

        {/* Session info */}
        <div className="bg-slate-800/60 rounded-xl px-4 py-3 mb-5 text-center">
          <p className="text-slate-300 text-xs font-mono">
            Logged in as{' '}
            <span className="text-neon-blue font-bold">{username || 'you'}</span>
          </p>
          <p className="text-slate-600 text-xs font-mono mt-0.5">
            ✅ Your progress is saved and will be here when you return
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onKeepAlive}
            className="w-full py-3 rounded-xl font-bold font-mono text-sm text-white transition-colors"
            style={{ background: 'linear-gradient(90deg, #0284c7, #a855f7)' }}
          >
            👋 Stay Logged In
          </button>
          <button
            onClick={onLogout}
            className="w-full py-2 rounded-xl font-mono text-xs text-slate-500 hover:text-red-400 transition-colors"
          >
            Log Out Now
          </button>
        </div>
      </motion.div>
    </div>
  )
}
