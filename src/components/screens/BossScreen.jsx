import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/gameStore.js'
import { estimateTokens } from '../../utils/tokenizer.js'
import { scorePrompt, scoreBossHit } from '../../utils/scorer.js'
import { playBossHit, playBossMiss, playError } from '../../utils/sound.js'

export default function BossScreen() {
  const {
    challenge, bossHp, bossMaxHp, bossSeqIdx, bossSequence,
    submitBossRound, goTo, soundEnabled,
  } = useGameStore()

  const [text,       setText]       = useState('')
  const [shake,      setShake]      = useState(false)
  const [hitMsg,     setHitMsg]     = useState('')
  const [phase,      setPhase]      = useState('idle') // idle | hitting | missed

  const hpPct = (bossHp / bossMaxHp) * 100

  useEffect(() => { setText(''); setPhase('idle'); setHitMsg('') }, [challenge?.id])

  function triggerShake() {
    setShake(true)
    setTimeout(() => setShake(false), 450)
  }

  function handleSubmit() {
    if (!text.trim() || !challenge) return
    const score  = scorePrompt(challenge.originalPrompt, text, challenge)
    const result = scoreBossHit(score)

    setHitMsg(result.message)

    if (result.damage > 0) {
      if (soundEnabled) playBossHit()
      setPhase('hitting')
    } else {
      if (soundEnabled) playBossMiss()
      triggerShake()
      setPhase('missed')
    }

    setTimeout(() => {
      setPhase('idle')
      submitBossRound(score, result.damage)
    }, 1000)
  }

  if (!challenge) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 min-h-screen px-4 py-6 max-w-2xl mx-auto"
    >
      {/* Back */}
      <button onClick={() => goTo('levelMap')} className="text-slate-500 hover:text-neon-blue text-sm mb-4 flex items-center gap-1 transition-colors">
        ← Retreat
      </button>

      {/* Boss header */}
      <div className="card p-5 mb-6 border-neon-red/30 bg-red-900/5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-black text-neon-red" style={{ fontFamily: 'Exo 2' }}>
              🐉 Token Boss
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Round {bossSeqIdx + 1} of {bossSequence.length}
            </p>
          </div>

          {/* Boss monster SVG */}
          <motion.div
            animate={phase === 'hitting' ? { x: [-5, 5, -5, 0], scale: [1, 0.9, 1] } : { y: [0, -4, 0] }}
            transition={phase === 'hitting' ? { duration: 0.4 } : { duration: 2, repeat: Infinity }}
            className="text-5xl select-none"
          >
            {bossHp <= 0 ? '💀' : bossHp < 30 ? '😤' : bossHp < 60 ? '😠' : '😈'}
          </motion.div>
        </div>

        {/* HP bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-slate-400">Boss HP</span>
            <span className={`font-bold ${hpPct < 30 ? 'text-neon-green' : hpPct < 60 ? 'text-neon-amber' : 'text-neon-red'}`}>
              {bossHp}/{bossMaxHp}
            </span>
          </div>
          <div className="boss-bar">
            <motion.div
              className="boss-bar-fill"
              animate={{ width: `${hpPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Round dots */}
        <div className="flex gap-2 mt-3">
          {bossSequence.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i < bossSeqIdx   ? 'bg-neon-green'  :
                i === bossSeqIdx ? 'bg-neon-amber animate-pulse' :
                'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Hit message */}
      <AnimatePresence>
        {hitMsg && (
          <motion.div
            key={hitMsg}
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0,   scale: 1 }}
            exit={{ opacity: 0 }}
            className={`text-center text-xl font-black mb-4 ${
              phase === 'missed' ? 'text-neon-red' : 'text-neon-green'
            }`}
            style={{ fontFamily: 'Exo 2' }}
          >
            {hitMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Challenge prompt */}
      <motion.div
        key={challenge.id}
        animate={shake ? { x: [-10, 10, -8, 8, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-widest font-mono mb-2 block">
            Optimize this prompt to damage the boss:
          </label>
          <div className="card p-4 border-neon-red/20 bg-red-900/5">
            <p className="font-mono text-sm text-slate-300 leading-relaxed">
              {challenge.originalPrompt}
            </p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-slate-500">Your Prompt</span>
            <span className="text-neon-blue">
              {estimateTokens(text)} tokens
            </span>
          </div>
          <textarea
            className="prompt-input min-h-[100px]"
            placeholder="Rewrite to deal maximum damage…"
            value={text}
            onChange={e => setText(e.target.value)}
            disabled={phase !== 'idle'}
          />
        </div>

        <div className="card p-3 text-xs text-slate-500 font-mono">
          💡 Score ≥85 → 30 dmg · ≥70 → 20 dmg · ≥55 → 12 dmg · ≥40 → 6 dmg · Below → MISS
        </div>

        <button
          className="btn-primary w-full"
          onClick={handleSubmit}
          disabled={!text.trim() || phase !== 'idle'}
        >
          {phase !== 'idle' ? '⚡ Attacking…' : '⚔️ Attack!'}
        </button>
      </motion.div>
    </motion.div>
  )
}
