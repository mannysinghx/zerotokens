/**
 * elo.js
 * Elo rating system for TokenQuest.
 * Player starts at 1000. Each challenge has an implicit Elo based on difficulty.
 * Winning raises Elo, losing lowers it (standard K=32 formula).
 */

export const ELO_START = 1000
const K = 32

/** Difficulty → baseline Elo of the "opponent" (the challenge) */
const DIFFICULTY_ELO = {
  beginner:     800,
  intermediate: 1000,
  advanced:     1200,
  expert:       1500,
}

/** Rank tiers */
export const ELO_RANKS = [
  { min: 1600, label: 'Grandmaster', color: '#fbbf24', emoji: '👑' },
  { min: 1400, label: 'Master',      color: '#a855f7', emoji: '💜' },
  { min: 1200, label: 'Diamond',     color: '#00d4ff', emoji: '💎' },
  { min: 1000, label: 'Gold',        color: '#f59e0b', emoji: '🥇' },
  { min:  800, label: 'Silver',      color: '#94a3b8', emoji: '🥈' },
  { min:  600, label: 'Bronze',      color: '#b45309', emoji: '🥉' },
  { min:    0, label: 'Novice',      color: '#475569', emoji: '🔰' },
]

/**
 * Expected score formula (standard Elo).
 */
function expected(playerElo, opponentElo) {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400))
}

/**
 * Calculate new player Elo after a challenge attempt.
 * @param {number} playerElo   – current player Elo
 * @param {string} difficulty  – beginner | intermediate | advanced | expert
 * @param {number} totalScore  – 0-100 score from scorer
 * @returns {{ newElo: number, delta: number }}
 */
export function calcNewElo(playerElo, difficulty, totalScore) {
  const opponentElo = DIFFICULTY_ELO[difficulty] ?? 1000
  const E = expected(playerElo, opponentElo)
  // Score outcome: treat totalScore≥70 as win (S=1), ≥40 as draw (0.5), else loss (0)
  const outcome = totalScore >= 70 ? 1 : totalScore >= 40 ? 0.5 : 0
  const delta = Math.round(K * (outcome - E))
  const newElo = Math.max(100, playerElo + delta)
  return { newElo, delta }
}

/**
 * Get rank info for a given Elo score.
 * @param {number} elo
 * @returns {{ label, color, emoji, min }}
 */
export function getEloRank(elo) {
  return ELO_RANKS.find(r => elo >= r.min) ?? ELO_RANKS[ELO_RANKS.length - 1]
}
