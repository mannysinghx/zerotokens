import { motion, AnimatePresence } from 'framer-motion'

const EXPRESSIONS = {
  idle:    { eyes: '#00d4ff', mouth: 'M 8 14 Q 12 17 16 14', blink: true },
  happy:   { eyes: '#10b981', mouth: 'M 6 13 Q 12 18 18 13', blink: false },
  excited: { eyes: '#f59e0b', mouth: 'M 7 13 Q 12 19 17 13', blink: false },
  hint:    { eyes: '#a855f7', mouth: 'M 8 14 Q 12 16 16 14', blink: true },
  warning: { eyes: '#ef4444', mouth: 'M 8 16 Q 12 13 16 16', blink: false },
}

export default function RobotGuide({ expression = 'idle', message, visible = true }) {
  const expr = EXPRESSIONS[expression] || EXPRESSIONS.idle

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex items-start gap-3"
        >
          {/* Robot SVG */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="shrink-0"
          >
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
              {/* Body */}
              <rect x="4" y="9" width="16" height="12" rx="3" fill="#1e293b" stroke={expr.eyes} strokeWidth="0.8"/>
              {/* Head */}
              <rect x="6" y="2" width="12" height="9" rx="2.5" fill="#1e293b" stroke={expr.eyes} strokeWidth="0.8"/>
              {/* Antenna */}
              <line x1="12" y1="2" x2="12" y2="0.5" stroke={expr.eyes} strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="12" cy="0.3" r="0.8" fill={expr.eyes}/>
              {/* Eyes */}
              <circle cx="9"  cy="5.5" r="1.5" fill={expr.eyes} opacity="0.9"/>
              <circle cx="15" cy="5.5" r="1.5" fill={expr.eyes} opacity="0.9"/>
              {/* Eye pupils */}
              <circle cx="9.4"  cy="5.3" r="0.5" fill="#0f172a"/>
              <circle cx="15.4" cy="5.3" r="0.5" fill="#0f172a"/>
              {/* Mouth */}
              <path d={expr.mouth} stroke={expr.eyes} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
              {/* Chest panel */}
              <rect x="9" y="11" width="6" height="4" rx="1" fill="rgba(0,212,255,0.1)" stroke={expr.eyes} strokeWidth="0.6"/>
              <circle cx="11" cy="13" r="0.7" fill={expr.eyes} opacity="0.6"/>
              <circle cx="13" cy="13" r="0.7" fill={expr.eyes} opacity="0.6"/>
              {/* Arms */}
              <rect x="1"  y="10" width="3" height="7" rx="1.5" fill="#1e293b" stroke={expr.eyes} strokeWidth="0.7"/>
              <rect x="20" y="10" width="3" height="7" rx="1.5" fill="#1e293b" stroke={expr.eyes} strokeWidth="0.7"/>
              {/* Legs */}
              <rect x="7"  y="21" width="4" height="3" rx="1.5" fill="#1e293b" stroke={expr.eyes} strokeWidth="0.7"/>
              <rect x="13" y="21" width="4" height="3" rx="1.5" fill="#1e293b" stroke={expr.eyes} strokeWidth="0.7"/>
              {/* Glow */}
              <circle cx="12" cy="12" r="11" fill="none" stroke={expr.eyes} strokeWidth="0.3" opacity="0.2"/>
            </svg>
          </motion.div>

          {/* Speech bubble */}
          {message && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              className="relative bg-bg-elevated border border-neon-blue/20 rounded-xl rounded-tl-none px-4 py-2.5 max-w-xs"
            >
              <div
                className="absolute -left-2 top-3 w-2 h-3"
                style={{ background: 'var(--bg-elevated)', clipPath: 'polygon(100% 0, 100% 100%, 0 50%)' }}
              />
              <p className="text-sm text-slate-300 leading-relaxed font-mono">{message}</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
