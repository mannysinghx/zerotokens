/**
 * spacedRepetition.js
 * SM-2 spaced repetition algorithm adapted for TokenQuest.
 * Tracks per-challenge review intervals so "weak" prompts resurface sooner.
 */

/**
 * Default progress record for a challenge not yet attempted.
 */
export const defaultProgress = {
  easeFactor:  2.5,   // SM-2 EF, minimum 1.3
  interval:    0,     // days until next review
  repetitions: 0,     // consecutive correct reviews
  dueDate:     null,  // ISO date string or null (null = never attempted)
  lastGrade:   null,
}

/**
 * Convert a numeric grade (0-100) to SM-2 quality rating (0-5).
 * SM-2 requires quality ≥ 3 to advance the interval.
 */
function gradeToQuality(totalScore) {
  if (totalScore >= 90) return 5
  if (totalScore >= 75) return 4
  if (totalScore >= 60) return 3
  if (totalScore >= 40) return 2
  if (totalScore >= 20) return 1
  return 0
}

/**
 * Update SM-2 record after a challenge attempt.
 * @param {object} prev  – previous progress record (use defaultProgress for first attempt)
 * @param {number} totalScore – 0-100
 * @returns {object} updated progress record
 */
export function sm2Update(prev = defaultProgress, totalScore) {
  const q = gradeToQuality(totalScore)
  let { easeFactor, interval, repetitions } = prev

  if (q < 3) {
    // Failed: reset streak, review again soon
    repetitions = 0
    interval    = 1
  } else {
    // Passed: advance interval
    if (repetitions === 0)      interval = 1
    else if (repetitions === 1) interval = 6
    else                        interval = Math.round(interval * easeFactor)
    repetitions += 1
  }

  // Update ease factor (minimum 1.3)
  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))

  const due = new Date()
  due.setDate(due.getDate() + interval)

  return {
    easeFactor:  parseFloat(easeFactor.toFixed(2)),
    interval,
    repetitions,
    dueDate:   due.toISOString().split('T')[0],
    lastGrade: totalScore,
  }
}

/**
 * Is this challenge due for review today (or overdue)?
 * @param {object|null|undefined} progress
 * @returns {boolean}
 */
export function isDue(progress) {
  if (!progress?.dueDate) return false   // never attempted = not due (use "new" badge instead)
  const today = new Date().toISOString().split('T')[0]
  return progress.dueDate <= today
}

/**
 * Days until next review (negative = overdue).
 * @param {object|null|undefined} progress
 * @returns {number|null}  null if never attempted
 */
export function daysUntilDue(progress) {
  if (!progress?.dueDate) return null
  const today   = new Date()
  today.setHours(0, 0, 0, 0)
  const due     = new Date(progress.dueDate)
  const diffMs  = due - today
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}
