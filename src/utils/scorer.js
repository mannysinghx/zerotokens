import { estimateTokens, countWords } from './tokenizer.js'

const ACTION_VERBS = [
  'write','summarize','explain','compare','classify','create','rewrite',
  'list','analyze','describe','generate','translate','review','suggest',
  'provide','draft','identify','extract','format','convert','evaluate',
  'outline','define','calculate','find','fix','improve','check','make',
]

const OUTPUT_FORMATS = [
  'email','bullet','json','list','table','paragraph','word','checklist',
  'report','summary','essay','steps','outline','chart','snippet',
]

const TONE_WORDS = [
  'professional','formal','casual','friendly','concise','brief',
  'detailed','simple','technical','conversational',
]

const LENGTH_PATTERNS = [
  /\d+\s*(words?|sentences?|paragraphs?|lines?|bullets?|items?)/i,
  /\b(short|brief|concise|long|comprehensive|detailed)\b/i,
  /\bin\s+\d+/i,
]

export function scorePrompt(original, optimized, challenge) {
  const orig  = estimateTokens(original)
  const optim = estimateTokens(optimized)
  const saved = Math.max(0, orig - optim)

  // --- Savings score (40%) ---
  const savingsRatio = orig > 0 ? saved / orig : 0
  // reward 20-60% reduction as peak range; penalise deleting everything
  const savingsScore = savingsRatio < 0.05
    ? 0
    : savingsRatio > 0.9
    ? Math.max(0, 100 - (savingsRatio - 0.9) * 500)
    : Math.min(100, savingsRatio * 200)

  // --- Clarity score (30%) ---
  const lower = optimized.toLowerCase()
  const hasVerb    = ACTION_VERBS.some(v => lower.includes(v))
  const hasFormat  = OUTPUT_FORMATS.some(f => lower.includes(f))
  const hasTone    = TONE_WORDS.some(t => lower.includes(t))
  const hasLength  = LENGTH_PATTERNS.some(p => p.test(optimized))
  const clarityScore =
    (hasVerb   ? 45 : 0) +
    (hasFormat ? 25 : 0) +
    (hasTone   ? 15 : 0) +
    (hasLength ? 15 : 0)

  // --- Intent score (20%) ---
  const concepts = challenge.requiredConcepts || []
  let covered = 0
  for (const c of concepts) {
    if (lower.includes(c.toLowerCase())) covered++
  }
  const intentScore = concepts.length > 0 ? (covered / concepts.length) * 100 : 65

  // --- Specificity score (10%) ---
  const specificityScore = (hasFormat || hasLength) ? 100 : 35

  // --- Penalties ---
  const words = countWords(optimized)
  const tooShort   = words < 4  ? 60 : words < 7  ? 30 : 0
  const tooLong    = optim > orig * 0.95 ? 20 : 0
  const emptyScore = optimized.trim().length < 3 ? 999 : 0  // yields 0 total

  const raw =
    savingsScore   * 0.40 +
    clarityScore   * 0.30 +
    intentScore    * 0.20 +
    specificityScore * 0.10

  const total = emptyScore > 100
    ? 0
    : Math.max(0, Math.min(100, raw - tooShort - tooLong))

  const grade =
    total >= 90 ? 'S' :
    total >= 75 ? 'A' :
    total >= 60 ? 'B' :
    total >= 40 ? 'C' : 'D'

  const baseCoins = challenge.rewardCoins ?? 100
  const coins = Math.round(baseCoins * (total / 100))
  const xp    = Math.round(total * 0.5)

  return {
    originalTokens:   orig,
    optimizedTokens:  optim,
    tokensSaved:      saved,
    savingsPct:       orig > 0 ? Math.round((saved / orig) * 100) : 0,
    savingsScore:     Math.round(savingsScore),
    clarityScore:     Math.round(clarityScore),
    intentScore:      Math.round(intentScore),
    specificityScore: Math.round(specificityScore),
    totalScore:       Math.round(total),
    grade,
    coins,
    xp,
    breakdown: { hasVerb, hasFormat, hasTone, hasLength, covered, total: concepts.length },
  }
}

export function scoreBossHit(score) {
  if (score.totalScore >= 85) return { damage: 30, message: 'CRITICAL HIT! 💥' }
  if (score.totalScore >= 70) return { damage: 20, message: 'STRONG HIT! ⚡' }
  if (score.totalScore >= 55) return { damage: 12, message: 'Good hit! ✨' }
  if (score.totalScore >= 40) return { damage:  6, message: 'Weak hit…' }
  return { damage: 0, message: 'MISS! Boss attacks! 👾' }
}
