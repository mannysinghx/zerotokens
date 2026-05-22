/**
 * leaderboard.js
 * Per-device employee leaderboard stored in localStorage.
 * All employees who have trained on this device appear here.
 * Ideal for shared training-room kiosks; works fine for individual installs (single row).
 */

const LB_KEY = 'token-quest-leaderboard'

function _read() {
  try {
    return JSON.parse(localStorage.getItem(LB_KEY) || '[]')
  } catch {
    return []
  }
}

function _write(data) {
  try {
    localStorage.setItem(LB_KEY, JSON.stringify(data))
  } catch {
    // Quota: shed oldest half and retry
    const trimmed = data.slice(-50)
    try { localStorage.setItem(LB_KEY, JSON.stringify(trimmed)) } catch {}
  }
}

/**
 * Build the snapshot object that goes into the leaderboard.
 * Call this after every submitAnswer() with the updated save.
 */
export function buildSnapshot(save, attempts = []) {
  const avgScore = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + (a.totalScore ?? 0), 0) / attempts.length)
    : 0

  const highestCertTier = save.certifications?.length
    ? Math.max(...save.certifications.map(c => {
        const lvl = { token_saver: 1, prompt_specialist: 2, ai_optimization_professional: 3 }
        return lvl[c.tierId] ?? 0
      }))
    : 0

  return {
    employeeId:         save.employeeId,
    username:           save.username,
    team:               save.team   || null,
    company:            save.company || null,
    playerElo:          save.playerElo         ?? 1000,
    xp:                 save.xp                ?? 0,
    completedCount:     (save.completedChallenges ?? []).length,
    totalTokensSaved:   save.totalTokensSaved   ?? 0,
    avgScore,
    highestCertTier,
    certifications:     save.certifications     ?? [],
    lastPlayedDate:     save.lastPlayedDate     || new Date().toISOString().split('T')[0],
  }
}

/**
 * Upsert an employee snapshot into the leaderboard (matched by employeeId).
 */
export function addOrUpdateLeaderboard(snapshot) {
  if (!snapshot?.employeeId) return
  const board = _read()
  const idx   = board.findIndex(e => e.employeeId === snapshot.employeeId)
  if (idx >= 0) board[idx] = snapshot
  else           board.push(snapshot)
  _write(board)
}

/**
 * Load the leaderboard sorted by Elo descending.
 * @returns {object[]}
 */
export function loadLeaderboard() {
  return _read().sort((a, b) => (b.playerElo ?? 0) - (a.playerElo ?? 0))
}

/**
 * Get a sorted unique list of teams from the leaderboard.
 * @returns {string[]}
 */
export function getTeams() {
  const teams = _read()
    .map(e => e.team)
    .filter(Boolean)
  return [...new Set(teams)].sort()
}
