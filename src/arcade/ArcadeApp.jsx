import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import KidsGame      from './KidsGame.jsx'
import LaserSwordGame from './LaserSwordGame.jsx'

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  dur: 2 + Math.random() * 3,
}))

const TOKENS_FLOATING = ['₮', '⟨T⟩', '{}', '</>','₮', '₮', '⟨T⟩']

function ModeCard({ emoji, title, sub, age, tagline, color, glow, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative rounded-2xl p-6 text-left w-72 border-2 cursor-pointer overflow-hidden"
      style={{ borderColor: color, background: 'linear-gradient(135deg, #0a0a1f, #12122a)', boxShadow: `0 0 30px ${glow}` }}
    >
      <div className="text-5xl mb-3">{emoji}</div>
      <div className="text-xl font-bold text-white mb-1" style={{ fontFamily: '"Exo 2", sans-serif' }}>{title}</div>
      <div className="text-sm mb-1" style={{ color }}>{sub}</div>
      <div className="text-xs text-slate-500 mb-2">{tagline}</div>
      <div className="text-xs font-semibold" style={{ color: '#ffffff55' }}>{age}</div>
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{ background: `radial-gradient(circle at 30% 50%, ${glow}, transparent 70%)` }}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 0.18 }}
      />
    </motion.button>
  )
}

export default function ArcadeApp() {
  const [mode, setMode] = useState(null)

  if (mode === 'kids')   return <KidsGame      onExit={() => setMode(null)} />
  if (mode === 'normal') return <LaserSwordGame mode="normal" onExit={() => setMode(null)} />

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden select-none"
      style={{ background: 'radial-gradient(ellipse at 40% 30%, #0a0a2e 0%, #000008 100%)' }}
    >
      {/* Starfield */}
      {STARS.map(s => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: s.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Floating token symbols */}
      {TOKENS_FLOATING.map((t, i) => (
        <motion.div
          key={i}
          className="absolute text-xs font-mono pointer-events-none"
          style={{ left: `${8 + i * 13}%`, color: i % 2 === 0 ? '#00ffff18' : '#ffcc0018' }}
          animate={{ y: [0, -18, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4 + i * 0.7, repeat: Infinity, delay: i * 0.5 }}
        >
          {t}
        </motion.div>
      ))}

      <div className="scanlines absolute inset-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-7 px-4 py-8">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold"
          style={{ background: 'linear-gradient(90deg, #00ff88, #00ccff)', color: '#000' }}
        >
          ✦ FREE TO PLAY &nbsp;·&nbsp; NO LOGIN NEEDED ✦
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <h1
            className="text-5xl md:text-6xl font-black tracking-tight text-white"
            style={{ fontFamily: '"Exo 2", sans-serif', textShadow: '0 0 40px #00ffff, 0 0 80px #0044ff' }}
          >
            ⚡ Token Wars
          </h1>
          <p className="text-slate-300 mt-2 text-base font-semibold" style={{ fontFamily: '"Exo 2", sans-serif' }}>
            Defend your prompt budget. Slash the wasteful AI bots.
          </p>
        </motion.div>

        {/* Lore box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="max-w-md text-center text-xs text-slate-400 px-4 py-3 rounded-xl border border-slate-800"
          style={{ background: '#0a0a1f' }}
        >
          <span className="text-yellow-400 font-bold">What are tokens?</span>{' '}
          AI models like ChatGPT and Claude read your message in tiny chunks called{' '}
          <span className="text-cyan-400 font-mono">tokens</span>. The more tokens you waste,
          the more it costs. In Token Wars, you fight the bots that drain your budget — and learn
          to write sharper prompts in the process. Every enemy slashed = tokens saved! <span className="text-yellow-400">₮</span>
        </motion.div>

        {/* Mode Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col sm:flex-row gap-5"
        >
          <ModeCard
            emoji="🌟"
            title="Token Pals"
            sub="Token Munchers · 5 lives · Auto-shield"
            tagline="Bots eat tokens — you stop them!"
            age="Kindergarten – Grade 5"
            color="#ffcc00"
            glow="#ffaa0055"
            onClick={() => setMode('kids')}
          />
          <ModeCard
            emoji="⚡"
            title="Token Master"
            sub="Fast AI models · Combos · MAX_TOKENS boss"
            tagline="Budget = power. Don't overflow."
            age="Grades 6 – 12"
            color="#00ffff"
            glow="#00ffff55"
            onClick={() => setMode('normal')}
          />
        </motion.div>

        {/* Enemy roster */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.38 }}
          className="flex gap-3 flex-wrap justify-center"
        >
          {[
            { label: 'Token Drainer', color: '#ff4455', desc: 'Drains budget fast' },
            { label: 'Context Bloater', color: '#9933ff', desc: 'Wastes context window' },
            { label: 'Hallucinator', color: '#ff8800', desc: 'Fires fake data blasts' },
            { label: 'MAX_TOKENS', color: '#ff0066', desc: 'Boss — total overflow' },
          ].map(e => (
            <div key={e.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border border-slate-800 bg-slate-950">
              <span className="w-2 h-2 rounded-full" style={{ background: e.color, boxShadow: `0 0 6px ${e.color}` }} />
              <span className="text-white font-mono">{e.label}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{e.desc}</span>
            </div>
          ))}
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-400 text-center"
        >
          {[
            ['← →  /  A D', 'Move'],
            ['Space  /  Z', 'Prompt Sword'],
            ['F  /  E', 'Token Beam'],
            ['Shift  /  C', 'Dodge'],
          ].map(([key, action]) => (
            <div key={action} className="bg-white/5 rounded-lg px-3 py-2">
              <div className="text-white font-mono text-xs mb-0.5">{key}</div>
              <div>{action}</div>
            </div>
          ))}
        </motion.div>

        <motion.a
          href="/"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-slate-600 hover:text-slate-400 text-xs transition-colors"
        >
          ← Back to Token Quest
        </motion.a>
      </div>
    </div>
  )
}
