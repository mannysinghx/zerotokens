const KEY         = 'token-quest-save'
const ARCHIVE_KEY = 'token-quest-archive'   // hidden — never wiped on reset

const DEFAULT_SAVE = {
  username: null,
  joinedAt: null,
  coins: 0,
  xp: 0,
  level: 1,
  completedChallenges: [],
  badges: [],
  streak: 0,
  lastPlayedDate: null,
  totalTokensSaved: 0,
  theme: 'neon',
  soundEnabled: true,
  highScores: {},
  sessions: 0,
}

// ── Active save ─────────────────────────────────────────────────────────────

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_SAVE }
    return { ...DEFAULT_SAVE, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_SAVE }
  }
}

export function writeSave(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {}
}

export function resetSave() {
  localStorage.removeItem(KEY)
  return { ...DEFAULT_SAVE }
}

export function updateStreak(save) {
  const today = new Date().toDateString()
  if (save.lastPlayedDate === today) return save
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  const streak = save.lastPlayedDate === yesterday ? save.streak + 1 : 1
  return { ...save, streak, lastPlayedDate: today }
}

// ── Hidden archive (persists across resets, used for agent training) ─────────

function _readArchive() {
  try {
    return JSON.parse(localStorage.getItem(ARCHIVE_KEY) || '{"sessions":[],"attempts":[]}')
  } catch {
    return { sessions: [], attempts: [] }
  }
}

function _writeArchive(data) {
  try {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(data))
  } catch {
    // Storage quota hit — shed oldest entries and retry once
    const trimmed = {
      sessions: (data.sessions || []).slice(-20),
      attempts: (data.attempts || []).slice(-300),
    }
    try { localStorage.setItem(ARCHIVE_KEY, JSON.stringify(trimmed)) } catch {}
  }
}

/**
 * Called on every resetProgress(). Snapshots the entire save so nothing is
 * truly lost — useful for analysing how players progressed before they reset.
 */
export function archiveSession(save) {
  const archive = _readArchive()
  archive.sessions.push({
    ...save,
    _archivedAt: new Date().toISOString(),
    _sessionId:  `s_${Date.now()}`,
  })
  _writeArchive(archive)
}

/**
 * Called on every challenge submission. Stores the raw training pair:
 * original prompt + what the user wrote + how well it scored.
 * This is the primary data for future agent fine-tuning.
 */
export function logAttempt(attempt) {
  const archive = _readArchive()
  archive.attempts.push({
    ...attempt,
    _timestamp: new Date().toISOString(),
  })
  _writeArchive(archive)
}

/** Public read — lets an export/admin tool inspect all collected data. */
export function loadArchive() {
  return _readArchive()
}
