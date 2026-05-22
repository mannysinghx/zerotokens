/**
 * powerEffects.js
 * Mechanical effects of powers unlocked by defeating villains.
 *
 * Powers:
 *   surgical_scalpel  → highlights filler words in the original prompt (fix_prompt mode)
 *   zero_shot_sniper  → shows concept coverage % on token_budget options
 *   loop_breaker      → explains WHY a distractor is an anti-pattern
 *
 * hasPower() checks completedChallenges against the villain's required count.
 */

import { VILLAINS, POWERS, getVillainProgress } from '../data/villains.js'

// ── Power gate check ─────────────────────────────────────────────────────────

/**
 * Returns true if the player has unlocked a specific power.
 * @param {string}   powerId            – e.g. 'surgical_scalpel'
 * @param {string[]} completedChallenges – from store
 */
export function hasPower(powerId, completedChallenges = []) {
  // Find the villain that grants this power
  const villain = VILLAINS.find(v => v.power === powerId)
  if (!villain) return false
  const { defeated } = getVillainProgress(villain.id, completedChallenges)
  return defeated
}

// ── Surgical Scalpel — filler word detection ──────────────────────────────────

const FILLER_WORDS = [
  'please', 'kindly', 'just', 'simply', 'basically', 'essentially',
  'very', 'really', 'quite', 'rather', 'somewhat', 'generally',
  'actually', 'honestly', 'literally', 'totally', 'absolutely',
  'in order to', 'as well as', 'due to the fact that', 'at this point in time',
  'it is important to note that', 'feel free to', 'go ahead and',
  'would you be able to', 'could you please', 'i was wondering if',
]

/**
 * Find all filler word matches in a text with their positions.
 * @param {string} text
 * @returns {Array<{word: string, start: number, end: number}>}
 */
export function findFillerWords(text) {
  if (!text) return []
  const results = []
  const lower   = text.toLowerCase()
  FILLER_WORDS.forEach(filler => {
    let idx = lower.indexOf(filler)
    while (idx !== -1) {
      results.push({ word: text.slice(idx, idx + filler.length), start: idx, end: idx + filler.length })
      idx = lower.indexOf(filler, idx + 1)
    }
  })
  // Sort by start position, deduplicate overlapping matches
  return results
    .sort((a, b) => a.start - b.start)
    .filter((r, i, arr) => i === 0 || r.start >= arr[i - 1].end)
}

// ── Zero-Shot Sniper — concept coverage ───────────────────────────────────────

/**
 * Returns a 0-100 score for how many key concepts from `original` appear in `candidate`.
 * Used to show "concept coverage" on each token_budget option.
 * @param {string} original
 * @param {string} candidate
 * @returns {{ pct: number, found: string[], missing: string[] }}
 */
export function getConceptCoverage(original, candidate) {
  if (!original || !candidate) return { pct: 0, found: [], missing: [] }

  // Extract nouns/verbs: words ≥5 chars, not stop words
  const STOP = new Set(['about', 'after', 'before', 'could', 'every', 'given', 'having',
    'least', 'might', 'other', 'shall', 'since', 'their', 'there', 'these', 'those',
    'under', 'until', 'which', 'while', 'would', 'write', 'please', 'kindly'])
  const extract = t => [...new Set(
    t.toLowerCase().match(/\b[a-z]{5,}\b/g)?.filter(w => !STOP.has(w)) ?? [],
  )]

  const origConcepts = extract(original)
  const candLower    = candidate.toLowerCase()
  const found   = origConcepts.filter(c => candLower.includes(c))
  const missing = origConcepts.filter(c => !candLower.includes(c))
  const pct     = origConcepts.length
    ? Math.round((found.length / origConcepts.length) * 100)
    : 100

  return { pct, found, missing }
}

// ── Loop Breaker — anti-pattern explanations ──────────────────────────────────

const ANTI_PATTERNS = [
  {
    pattern: /please|kindly|could you|would you/i,
    name:    'Politeness padding',
    tip:     'LLMs don\'t need pleasantries. Cutting them saves tokens with zero quality loss.',
  },
  {
    pattern: /in order to|so that you can/i,
    name:    'Wordy purpose clause',
    tip:     '"in order to" → "to". Same meaning, fewer tokens.',
  },
  {
    pattern: /very|really|quite|rather|extremely|incredibly/i,
    name:    'Intensifier overload',
    tip:     'Intensifiers add length but rarely change AI output. Use precise adjectives instead.',
  },
  {
    pattern: /as well as|in addition to|furthermore|moreover/i,
    name:    'Redundant connectors',
    tip:     'Use "and" or rewrite as a list. Multi-word connectors inflate token count.',
  },
  {
    pattern: /\bplease note\b|\bit is worth\b|\bit should be noted\b/i,
    name:    'Meta-commentary filler',
    tip:     'State the thing directly. "Please note that X" → "X".',
  },
]

export const ANTI_PATTERN_MSG = {
  surgical_scalpel: null,
  zero_shot_sniper:  null,
  loop_breaker:     'Loop Breaker active: anti-patterns explained below.',
}

/**
 * Classify a distractor option — explain why it's suboptimal.
 * @param {string} text   – the option text
 * @returns {string|null} explanation or null if no known anti-pattern found
 */
export function classifyDistractor(text) {
  if (!text) return null
  for (const ap of ANTI_PATTERNS) {
    if (ap.pattern.test(text)) {
      return `⚠️ ${ap.name}: ${ap.tip}`
    }
  }
  return null
}
