/**
 * EloChip.jsx
 * Displays the player's Elo rating with rank badge and optional delta after a match.
 */
import { motion, AnimatePresence } from 'framer-motion'
import { getEloRank } from '../../utils/elo.js'

export default function EloChip({ elo = 1000, delta = null, size = 'md' }) {
  const rank = getEloRank(elo)

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1   gap-1.5',
    lg: 'text-base px-4 py-2 gap-2',
  }[size] ?? 'text-sm px-3 py-1 gap-1.5'

  return (
    <div className="flex items-center gap-2">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1,   opacity: 1 }}
        className={`inline-flex items-center rounded-full border font-mono font-bold ${sizeClasses}`}
        style={{ borderColor: rank.color + '55', background: rank.color + '12', color: rank.color }}
      >
        <span>{rank.emoji}</span>
        <span>{rank.label}</span>
        <span className="opacity-70">#{elo}</span>
      </motion.div>

      <AnimatePresence>
        {delta != null && delta !== 0 && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x:  0 }}
            exit={{    opacity: 0, x:  6 }}
            className={`text-xs font-mono font-bold ${delta > 0 ? 'text-neon-green' : 'text-neon-red'}`}
          >
            {delta > 0 ? `+${delta}` : delta}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
