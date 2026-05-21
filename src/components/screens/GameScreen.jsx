import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/gameStore.js'
import { estimateTokens } from '../../utils/tokenizer.js'
import { scorePrompt } from '../../utils/scorer.js'
import RobotGuide from '../ui/RobotGuide.jsx'
import { playClick, playError, playSuccess } from '../../utils/sound.js'
import { VILLAINS, getVillainProgress } from '../../data/villains.js'

// ── Unified choice component for all three game modes ───────────────────────
function ChoiceMode({ challenge, onSubmit, soundEnabled }) {
  const [selected,  setSelected]  = useState(null)
  const [revealed,  setRevealed]  = useState(false)

  const modeLabel = {
    fix_prompt:   'Which rewrite best fixes this prompt?',
    token_budget: `Which version fits under ${challenge.maxTokens} tokens?`,
    choose_best:  'Which prompt is the most effective?',
  }[challenge.mode] || 'Pick the best option →'

  function handleSelect(idx) {
    if (revealed) return
    setSelected(idx)
    setRevealed(true)
    const correct = idx === challenge.correctOption
    if (soundEnabled) correct ? playSuccess() : playError()
    // correctOptionText, isCorrect, userPickedText
    setTimeout(() => onSubmit(
      challenge.options[challenge.correctOption],
      correct,
      challenge.options[idx],
    ), 1200)
  }

  return (
    <div className="space-y-5">
      {/* Original prompt */}
      <div>
        <label className="text-xs text-slate-500 uppercase tracking-widest font-mono mb-2 block">
          Original Prompt · {estimateTokens(challenge.originalPrompt)} tokens
        </label>
        <div className="card p-4 border-neon-red/20 bg-red-900/5">
          <p className="font-mono text-sm text-slate-300 leading-relaxed">
            {challenge.originalPrompt}
          </p>
        </div>
      </div>

      {/* Options */}
      <div>
        <label className="text-xs text-slate-500 uppercase tracking-widest font-mono mb-3 block">
          {modeLabel}
        </label>
        <div className="space-y-3">
          {challenge.options.map((opt, i) => {
            const tokenCount = estimateTokens(opt)
            const overBudget = challenge.mode === 'token_budget' && tokenCount > challenge.maxTokens
            let cls = 'option-card'
            if (revealed) {
              if (i === challenge.correctOption) cls += ' selected-correct'
              else if (i === selected)           cls += ' selected-wrong'
            }

            return (
              <motion.button
                key={i}
                className={cls}
                onClick={() => handleSelect(i)}
                whileHover={!revealed ? { scale: 1.01, y: -1 } : {}}
                whileTap={!revealed  ? { scale: 0.99 }         : {}}
                style={overBudget && !revealed
                  ? { borderColor: 'rgba(239,68,68,0.2)', opacity: 0.75 }
                  : {}}
              >
                <div className="flex items-start gap-3">
                  {/* Letter badge */}
                  <span className="shrink-0 w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold mt-0.5">
                    {String.fromCharCode(65 + i)}
                  </span>

                  {/* Option text */}
                  <span className="flex-1 text-left text-sm leading-relaxed">{opt}</span>

                  {/* Token budget pill */}
                  {challenge.mode === 'token_budget' && (
                    <span className={`shrink-0 text-xs font-mono px-1.5 py-0.5 rounded border ml-1 ${
                      overBudget
                        ? 'text-neon-red border-neon-red/30 bg-red-900/10'
                        : 'text-neon-green border-neon-green/30 bg-green-900/10'
                    }`}>
                      {tokenCount}t {overBudget ? '✗' : '✓'}
                    </span>
                  )}
                </div>

                {/* Reveal feedback */}
                <AnimatePresence>
                  {revealed && i === challenge.correctOption && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 text-xs text-neon-green font-mono"
                    >
                      ✓ Best answer
                    </motion.div>
                  )}
                  {revealed && i === selected && i !== challenge.correctOption && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 text-xs text-neon-red font-mono"
                    >
                      ✗ Not the best — see the correct answer above
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Main game screen ─────────────────────────────────────────────────────────
export default function GameScreen() {
  const { challenge, combo, goTo, submitAnswer, soundEnabled } = useGameStore()
  const [robotMsg,  setRobotMsg]  = useState('')
  const [robotExpr, setRobotExpr] = useState('idle')

  useEffect(() => {
    if (!challenge) return
    const msgs = {
      fix_prompt:   'Pick the version that saves the most tokens without losing any meaning.',
      choose_best:  'Study each option. Which one is specific, clear, and concise?',
      token_budget: `Only one option stays under ${challenge.maxTokens} tokens AND covers all the bases.`,
    }
    setRobotMsg(msgs[challenge.mode] || '')
    setRobotExpr('hint')
  }, [challenge])

  // correctOptionText = the ideal answer text
  // isCorrect         = boolean: did the user pick the right one?
  // userPickedText    = the exact option text the user selected
  const handleSubmit = useCallback((correctOptionText, isCorrect, userPickedText) => {
    if (!challenge) return

    let score

    if (challenge.mode === 'choose_best') {
      // Binary scoring: right = A, wrong = D
      score = {
        originalTokens:   estimateTokens(challenge.originalPrompt),
        optimizedTokens:  estimateTokens(correctOptionText),
        tokensSaved:      Math.max(0, estimateTokens(challenge.originalPrompt) - estimateTokens(correctOptionText)),
        savingsPct:       0,
        totalScore:       isCorrect ? 85 : 30,
        grade:            isCorrect ? 'A' : 'D',
        coins:            isCorrect ? Math.round(challenge.rewardCoins * 0.85) : Math.round(challenge.rewardCoins * 0.1),
        xp:               isCorrect ? 40 : 5,
        clarityScore:     isCorrect ? 80 : 20,
        intentScore:      isCorrect ? 90 : 30,
        specificityScore: isCorrect ? 85 : 25,
        savingsScore:     isCorrect ? 70 : 20,
        breakdown:        {},
      }
    } else if (challenge.mode === 'token_budget') {
      // If the user picked the correct (under-budget) option, run through full scorer
      // If they picked an over-budget or vague option, auto-fail
      if (isCorrect) {
        score = scorePrompt(challenge.originalPrompt, userPickedText, challenge)
      } else {
        score = {
          originalTokens:   estimateTokens(challenge.originalPrompt),
          optimizedTokens:  estimateTokens(userPickedText),
          tokensSaved:      0,
          savingsPct:       0,
          totalScore:       20,
          grade:            'D',
          coins:            Math.round(challenge.rewardCoins * 0.1),
          xp:               5,
          clarityScore:     20,
          intentScore:      20,
          specificityScore: 20,
          savingsScore:     0,
          breakdown:        {},
        }
      }
    } else {
      // fix_prompt: run through full scorer on the selected option text.
      // The ideal option scores S/A naturally; distractors score lower.
      score = scorePrompt(challenge.originalPrompt, userPickedText, challenge)
    }

    // Attach training metadata (stripped from UI, written to hidden archive)
    score._meta = {
      challengeId:    challenge.id,
      challengeTitle: challenge.title,
      mode:           challenge.mode,
      villain:        challenge.villain || null,
      difficulty:     challenge.difficulty,
      level:          challenge.level,
      originalPrompt: challenge.originalPrompt,
      userInput:      userPickedText,
      correctAnswer:  correctOptionText,
      isCorrect,
    }

    setRobotExpr(score.totalScore >= 70 ? 'happy' : score.totalScore >= 50 ? 'idle' : 'warning')
    submitAnswer(score)
  }, [challenge, submitAnswer])

  if (!challenge) {
    return (
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">🎉</div>
          <p className="text-slate-400 mb-4">All challenges complete!</p>
          <button className="btn-primary" onClick={() => goTo('levelMap')}>View Level Map</button>
        </div>
      </div>
    )
  }

  const difficultyColors = {
    beginner:     'text-neon-green',
    intermediate: 'text-neon-blue',
    advanced:     'text-neon-purple',
    expert:       'text-neon-amber',
  }

  return (
    <motion.div
      key={challenge.id}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="relative z-10 min-h-screen px-4 py-6 max-w-2xl mx-auto"
    >
      {/* Back */}
      <button
        onClick={() => { playClick(); goTo('levelMap') }}
        className="text-slate-500 hover:text-neon-blue text-sm mb-5 flex items-center gap-1 transition-colors"
      >
        ← Level Map
      </button>

      {/* Challenge header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <span className={`text-xs font-mono uppercase font-bold ${difficultyColors[challenge.difficulty]}`}>
            {challenge.difficulty}
          </span>
          <span className="text-xs text-slate-600 font-mono">·</span>
          <span className="text-xs text-slate-500 font-mono capitalize">
            {challenge.mode.replace('_', ' ')}
          </span>
          <span className="text-xs text-slate-600 font-mono">·</span>
          <span className="text-xs text-neon-amber font-mono">🪙 {challenge.rewardCoins}</span>
          {combo > 1 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-xs font-bold text-neon-purple bg-neon-purple/10 border border-neon-purple/30 px-2 py-0.5 rounded-full font-mono"
            >
              ⚡ {combo}× COMBO
            </motion.span>
          )}
        </div>

        <h1 className="text-2xl font-black text-slate-100 mb-3" style={{ fontFamily: 'Exo 2' }}>
          {challenge.title}
        </h1>

        {/* Villain tag */}
        {(() => {
          const villain = challenge.villain ? VILLAINS.find(v => v.id === challenge.villain) : null
          if (!villain) return null
          const { done, total } = getVillainProgress(villain.id, useGameStore.getState().completedChallenges)
          return (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => { playClick(); useGameStore.getState().goTo('villains') }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all hover:scale-105"
              style={{ borderColor: villain.color + '44', background: villain.color + '0d', color: villain.color }}
            >
              <span>{villain.emoji.split('💥')[0]}</span>
              <span className="font-bold">Fighting: {villain.name}</span>
              <span className="text-slate-500 ml-1">{done}/{total} slain</span>
            </motion.button>
          )
        })()}
      </div>

      {/* Robot guide */}
      <div className="mb-6">
        <RobotGuide expression={robotExpr} message={robotMsg} visible={!!robotMsg} />
      </div>

      <hr className="glow-divider" />

      {/* Unified choice UI for all modes */}
      <div className="mt-6">
        <ChoiceMode
          challenge={challenge}
          onSubmit={handleSubmit}
          soundEnabled={soundEnabled}
        />
      </div>
    </motion.div>
  )
}
