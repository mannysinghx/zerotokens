/**
 * analytics.js
 * Derives gameplay insights from the hidden archive + active save.
 * All functions are pure — no side effects, no store access.
 */

import { loadArchive } from './storage.js'

// ── Radar chart data ──────────────────────────────────────────────────────────

/**
 * Build 5-axis radar data from archived attempts.
 * Axes: Efficiency, Clarity, Intent, Specificity, Consistency
 * @returns {Array<{axis: string, value: number}>}  values 0-100
 */
export function buildRadarData(attempts) {
  if (!attempts || attempts.length === 0) {
    return [
      { axis: 'Efficiency',   value: 0 },
      { axis: 'Clarity',      value: 0 },
      { axis: 'Intent',       value: 0 },
      { axis: 'Specificity',  value: 0 },
      { axis: 'Consistency',  value: 0 },
    ]
  }

  const avg = key => {
    const vals = attempts.map(a => a[key]).filter(v => v != null && !isNaN(v))
    return vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 0
  }

  // Consistency = how often the user picks S or A grade (≥85 score)
  const consistencyPct = Math.round(
    (attempts.filter(a => (a.totalScore ?? 0) >= 85).length / attempts.length) * 100,
  )

  return [
    { axis: 'Efficiency',  value: avg('savingsScore')     },
    { axis: 'Clarity',     value: avg('clarityScore')     },
    { axis: 'Intent',      value: avg('intentScore')      },
    { axis: 'Specificity', value: avg('specificityScore') },
    { axis: 'Consistency', value: consistencyPct          },
  ]
}

// ── Grade distribution ────────────────────────────────────────────────────────

export function buildGradeDistribution(attempts) {
  const dist = { S: 0, A: 0, B: 0, C: 0, D: 0 }
  attempts.forEach(a => {
    if (a.grade && dist[a.grade] !== undefined) dist[a.grade]++
  })
  return dist
}

// ── Improvement curve (rolling average) ──────────────────────────────────────

/**
 * Returns an array of { index, score } representing rolling avg score over time.
 * window = number of attempts to average together.
 */
export function buildImprovementCurve(attempts, window = 5) {
  if (!attempts || attempts.length < 2) return []
  return attempts.map((a, i) => {
    const slice = attempts.slice(Math.max(0, i - window + 1), i + 1)
    const avg   = slice.reduce((s, x) => s + (x.totalScore ?? 0), 0) / slice.length
    return { index: i + 1, score: Math.round(avg) }
  })
}

// ── Prompt DNA ────────────────────────────────────────────────────────────────

const ACTION_VERBS  = ['write', 'list', 'explain', 'summarize', 'create', 'generate', 'describe', 'compare', 'analyze', 'draft', 'provide', 'give', 'show']
const FORMAT_WORDS  = ['bullet', 'table', 'numbered', 'json', 'markdown', 'format', 'list', 'paragraph', 'heading', 'section']
const TONE_WORDS    = ['formal', 'casual', 'professional', 'concise', 'brief', 'detailed', 'friendly', 'technical', 'simple', 'clear']
const LENGTH_WORDS  = ['word', 'sentence', 'paragraph', 'short', 'long', 'brief', '100', '200', '500', 'under', 'within', 'max']

function hasSignal(text, words) {
  const lower = text.toLowerCase()
  return words.some(w => lower.includes(w))
}

/**
 * Prompt DNA: what percentage of the user's submissions contain each signal.
 * @param {string[]} inputs  – array of userInput strings
 * @returns {{ actionVerb, outputFormat, tone, lengthConstraint }}  each 0-100
 */
export function buildPromptDNA(inputs) {
  if (!inputs || inputs.length === 0) {
    return { actionVerb: 0, outputFormat: 0, tone: 0, lengthConstraint: 0 }
  }
  const pct = (words) =>
    Math.round((inputs.filter(t => hasSignal(t, words)).length / inputs.length) * 100)
  return {
    actionVerb:      pct(ACTION_VERBS),
    outputFormat:    pct(FORMAT_WORDS),
    tone:            pct(TONE_WORDS),
    lengthConstraint:pct(LENGTH_WORDS),
  }
}

// ── Mode performance ──────────────────────────────────────────────────────────

export function buildModePerformance(attempts) {
  const modes = {}
  attempts.forEach(a => {
    const m = a.mode || 'unknown'
    if (!modes[m]) modes[m] = { total: 0, sum: 0 }
    modes[m].total++
    modes[m].sum += (a.totalScore ?? 0)
  })
  return Object.entries(modes).map(([mode, d]) => ({
    mode,
    avg: Math.round(d.sum / d.total),
    count: d.total,
  }))
}

// ── Master compute function ───────────────────────────────────────────────────

/**
 * Compute all analytics in one call.
 * @returns {{
 *   radarData, gradeDistribution, improvementCurve,
 *   promptDNA, modePerformance, totalAttempts,
 *   avgScore, bestStreak
 * }}
 */
export function computeAnalytics() {
  const { attempts } = loadArchive()

  if (!attempts || attempts.length === 0) {
    return {
      radarData:         buildRadarData([]),
      gradeDistribution: buildGradeDistribution([]),
      improvementCurve:  [],
      promptDNA:         buildPromptDNA([]),
      modePerformance:   [],
      totalAttempts:     0,
      avgScore:          0,
      bestStreak:        0,
    }
  }

  const inputs = attempts.map(a => a.userInput).filter(Boolean)
  const avgScore = Math.round(
    attempts.reduce((s, a) => s + (a.totalScore ?? 0), 0) / attempts.length,
  )

  // Best streak of consecutive A/S grades
  let bestStreak = 0, cur = 0
  attempts.forEach(a => {
    if ((a.totalScore ?? 0) >= 75) { cur++; bestStreak = Math.max(bestStreak, cur) }
    else cur = 0
  })

  return {
    radarData:         buildRadarData(attempts),
    gradeDistribution: buildGradeDistribution(attempts),
    improvementCurve:  buildImprovementCurve(attempts),
    promptDNA:         buildPromptDNA(inputs),
    modePerformance:   buildModePerformance(attempts),
    totalAttempts:     attempts.length,
    avgScore,
    bestStreak,
  }
}
