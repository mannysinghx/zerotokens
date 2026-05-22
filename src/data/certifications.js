/**
 * certifications.js
 * Three-tier certification system for TokenQuest Corporate.
 *
 * Tier 1 — Token Saver        🥉  complete 5 challenges (any score)
 * Tier 2 — Prompt Specialist  🥈  complete 15 challenges, avgScore ≥ 60
 * Tier 3 — AI Optimization    🏆  complete all 25 challenges, avgScore ≥ 75
 *           Professional
 */

export const CERT_TIERS = [
  {
    id:          'token_saver',
    level:       1,
    name:        'Token Saver',
    subtitle:    'Foundations of AI Prompt Optimisation',
    emoji:       '🥉',
    color:       '#b45309',
    bgColor:     '#78350f22',
    borderColor: '#b4530944',
    requirement: 'Complete 5 challenges',
    detail:      'Awarded for completing your first 5 prompt-optimisation challenges.',
    check: ({ completedCount }) => completedCount >= 5,
  },
  {
    id:          'prompt_specialist',
    level:       2,
    name:        'Prompt Specialist',
    subtitle:    'Intermediate AI Communication Skills',
    emoji:       '🥈',
    color:       '#94a3b8',
    bgColor:     '#47556922',
    borderColor: '#94a3b844',
    requirement: 'Complete 15 challenges · avg score ≥ 60%',
    detail:      'Awarded for completing 15 challenges while maintaining an average score of 60% or higher.',
    check: ({ completedCount, avgScore }) => completedCount >= 15 && avgScore >= 60,
  },
  {
    id:          'ai_optimization_professional',
    level:       3,
    name:        'AI Optimisation Professional',
    subtitle:    'Advanced Prompt Engineering Mastery',
    emoji:       '🏆',
    color:       '#f59e0b',
    bgColor:     '#92400e22',
    borderColor: '#f59e0b44',
    requirement: 'Complete all 25 challenges · avg score ≥ 75%',
    detail:      'The highest TokenQuest certification. Awarded for completing all challenges with an average score of 75% or higher.',
    check: ({ completedCount, avgScore }) => completedCount >= 25 && avgScore >= 75,
  },
]

/**
 * Check which new tiers have just been unlocked.
 * @param {{ completedCount: number, avgScore: number }} stats
 * @param {string[]} alreadyEarned  – array of tier IDs already in save.certifications
 * @returns {object[]}  array of newly earned CERT_TIERS objects
 */
export function checkCertifications(stats, alreadyEarned = []) {
  const earnedIds = new Set(alreadyEarned.map(c => c.tierId ?? c))
  return CERT_TIERS.filter(t => !earnedIds.has(t.id) && t.check(stats))
}

/**
 * Returns the highest-level earned tier object, or null if none earned.
 * @param {object[]} certifications  – save.certifications array
 */
export function getHighestTier(certifications = []) {
  if (!certifications.length) return null
  const earnedIds = new Set(certifications.map(c => c.tierId))
  const earned = CERT_TIERS.filter(t => earnedIds.has(t.id))
  return earned.reduce((best, t) => (!best || t.level > best.level ? t : best), null)
}

/**
 * Returns the next locked tier the employee should aim for, or null if all earned.
 * @param {object[]} certifications  – save.certifications array
 */
export function getNextTier(certifications = []) {
  const earnedIds = new Set(certifications.map(c => c.tierId))
  return CERT_TIERS.find(t => !earnedIds.has(t.id)) ?? null
}
