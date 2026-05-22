import { motion } from 'framer-motion'
import useGameStore from '../../store/gameStore.js'
import { playClick } from '../../utils/sound.js'

export default function Header() {
  const { coins, xp, streak, soundEnabled, screen, username, goTo, toggleSound } = useGameStore()

  // Don't show header on username setup screen
  if (screen === 'username') return null

  const showNav = screen !== 'landing'

  return (
    <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-neon-blue/10 bg-bg-primary/60 backdrop-blur-sm">
      {/* Logo */}
      <button
        onClick={() => { playClick(); goTo('landing') }}
        className="flex items-center gap-2 group"
      >
        <motion.span
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-2xl"
        >🤖</motion.span>
        <span
          className="font-black text-lg tracking-wider text-neon-blue neon-text hidden sm:block"
          style={{ fontFamily: 'Exo 2, sans-serif' }}
        >
          TOKEN<span className="text-neon-purple">QUEST</span>
        </span>
      </button>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Username chip */}
        {username && (
          <button
            onClick={() => { playClick(); goTo('landing') }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-neon-purple/30 bg-neon-purple/5 text-neon-purple text-xs font-bold font-mono transition-all hover:border-neon-purple/60"
          >
            <span>👤</span>
            <span>{username}</span>
          </button>
        )}

        {/* Streak */}
        {streak > 0 && (
          <div className="flex items-center gap-1 text-sm">
            <span>🔥</span>
            <span className="text-neon-amber font-bold font-mono">{streak}</span>
          </div>
        )}

        <StatChip icon="🪙" value={coins.toLocaleString()} color="amber" />
        <StatChip icon="⚡" value={xp.toLocaleString()}    color="blue"  label="XP" />

        {/* Nav */}
        {showNav && (
          <>
            <button
              onClick={() => { playClick(); goTo('levelMap') }}
              className="btn-neon text-xs px-3 py-1.5 hidden sm:flex items-center gap-1"
            >
              🗺 Map
            </button>
            <button
              onClick={() => { playClick(); goTo('villains') }}
              className="btn-neon text-xs px-3 py-1.5 hidden sm:flex items-center gap-1"
              style={{ borderColor: '#ef4444', color: '#ef4444' }}
            >
              👾 Villains
            </button>
            <button
              onClick={() => { playClick(); goTo('badges') }}
              className="btn-neon text-xs px-3 py-1.5 hidden sm:flex items-center gap-1"
            >
              🏅 Badges
            </button>
            <button
              onClick={() => { playClick(); goTo('stats') }}
              className="btn-neon text-xs px-3 py-1.5 hidden sm:flex items-center gap-1"
              style={{ borderColor: '#a855f7', color: '#a855f7' }}
            >
              📊 Stats
            </button>
          </>
        )}

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          className="w-8 h-8 rounded-full border border-white/10 hover:border-neon-blue/40 flex items-center justify-center transition-colors text-sm"
          title={soundEnabled ? 'Mute sound' : 'Enable sound'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>
    </header>
  )
}

function StatChip({ icon, value, color, label }) {
  const colorMap = {
    amber: 'text-neon-amber border-neon-amber/30 bg-neon-amber/5',
    blue:  'text-neon-blue  border-neon-blue/30  bg-neon-blue/5',
  }
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-sm font-bold ${colorMap[color]}`}>
      <span>{icon}</span>
      <span>{value}</span>
      {label && <span className="text-xs opacity-60">{label}</span>}
    </div>
  )
}
