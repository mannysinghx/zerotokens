import { create } from 'zustand'
import { loadSave, writeSave, updateStreak, archiveSession, logAttempt } from '../utils/storage.js'
import { calcNewElo, ELO_START } from '../utils/elo.js'
import { sm2Update, defaultProgress } from '../utils/spacedRepetition.js'
import { checkCertifications } from '../data/certifications.js'
import { addOrUpdateLeaderboard, buildSnapshot } from '../utils/leaderboard.js'
import { loadArchive } from '../utils/storage.js'
import challenges from '../data/challenges.json'

const BADGES = [
  { id: 'first_blood',  name: 'First Strike',    icon: '⚔️',  desc: 'Complete your first challenge',   condition: s => s.completedChallenges.length >= 1 },
  { id: 'tokens_100',   name: '100 Saved',        icon: '💰',  desc: 'Save 100 total tokens',           condition: s => s.totalTokensSaved >= 100 },
  { id: 'tokens_500',   name: '500 Saved',        icon: '💎',  desc: 'Save 500 total tokens',           condition: s => s.totalTokensSaved >= 500 },
  { id: 'tokens_1k',    name: '1K Club',          icon: '🏆',  desc: 'Save 1,000 total tokens',         condition: s => s.totalTokensSaved >= 1000 },
  { id: 'tokens_10k',   name: 'Legend',           icon: '👑',  desc: 'Save 10,000 total tokens',        condition: s => s.totalTokensSaved >= 10000 },
  { id: 'streak_3',     name: 'On Fire',          icon: '🔥',  desc: '3-day play streak',               condition: s => s.streak >= 3 },
  { id: 'streak_7',     name: 'Unstoppable',      icon: '⚡',  desc: '7-day play streak',               condition: s => s.streak >= 7 },
  { id: 'perfectionist',name: 'Perfectionist',    icon: '✨',  desc: 'Score 100% on any challenge',     condition: (s, last) => last?.totalScore >= 100 },
  { id: 'grade_s',      name: 'S-Rank',           icon: '🌟',  desc: 'Earn an S grade',                 condition: (s, last) => last?.grade === 'S' },
  { id: 'combo_5',      name: 'Combo Master',     icon: '💥',  desc: 'Get 5 combo multiplier',          condition: s => s.maxCombo >= 5 },
  { id: 'boss_slayer',  name: 'Boss Slayer',       icon: '🐉',  desc: 'Defeat the Token Boss',           condition: s => s.bossDefeated },
  { id: 'all_modes',    name: 'Versatile',         icon: '🎯',  desc: 'Complete all 3 game modes',       condition: s => {
    const modes = new Set(challenges.filter(c => s.completedChallenges.includes(c.id)).map(c => c.mode))
    return modes.has('fix_prompt') && modes.has('choose_best') && modes.has('token_budget')
  }},
]

function checkBadges(save, lastScore) {
  const newBadges = []
  for (const b of BADGES) {
    if (!save.badges.includes(b.id) && b.condition({ ...save }, lastScore)) {
      newBadges.push(b.id)
    }
  }
  return newBadges
}

const useGameStore = create((set, get) => {
  const initialSave = loadSave()
  return {
    // ── Screen routing ──
    screen: 'landing',   // landing | levelMap | game | boss | results | badges

    // ── Current challenge ──
    challenge:    null,
    challengeIdx: 0,      // which challenge in current session
    lastScore:    null,

    // ── Boss battle state ──
    bossHp:          100,
    bossMaxHp:       100,
    bossSequence:    [],
    bossSeqIdx:      0,
    bossDefeated:    false,

    // ── Combo ──
    combo:    0,
    maxCombo: initialSave.maxCombo || 0,

    // ── Elo ──
    _lastEloDelta: 0,

    // ── Newly unlocked badges / certs this session ──
    newBadges: [],
    newCerts:  [],

    // ── Certificate to view ──
    _certToView: null,

    // ── Persisted progress ──
    ...initialSave,

    // ── ACTIONS ──

    goTo(screen) {
      set({ screen, newBadges: [] })
    },

    startChallenge(challengeId) {
      const c = challenges.find(x => x.id === challengeId)
        || challenges.find(x => !get().completedChallenges.includes(x.id))
        || challenges[0]
      set({ challenge: c, screen: 'game', lastScore: null })
    },

    startBoss() {
      const bossPool = challenges.filter(c => c.difficulty === 'advanced' || c.difficulty === 'expert').slice(0, 5)
      set({ screen: 'boss', bossHp: 100, bossMaxHp: 100, bossSequence: bossPool, bossSeqIdx: 0, challenge: bossPool[0], lastScore: null })
    },

    submitAnswer(score) {
      const state      = get()
      const save       = loadSave()
      const newStreak  = updateStreak(save)

      const combo      = score.totalScore >= 70 ? state.combo + 1 : 0
      const maxCombo   = Math.max(state.maxCombo || 0, combo)
      const comboBonus = Math.floor(score.coins * (combo > 1 ? Math.min(combo * 0.1, 0.5) : 0))
      const finalCoins = score.coins + comboBonus
      const finalXp    = score.xp

      const newCompleted = state.challenge && !newStreak.completedChallenges?.includes(state.challenge.id)
        ? [...(newStreak.completedChallenges || []), state.challenge.id]
        : (newStreak.completedChallenges || [])

      // ── Elo update ──────────────────────────────────────────────────────
      const currentElo   = newStreak.playerElo ?? ELO_START
      const { newElo, delta: eloDelta } = state.challenge
        ? calcNewElo(currentElo, state.challenge.difficulty, score.totalScore)
        : { newElo: currentElo, delta: 0 }

      // ── Spaced repetition update ─────────────────────────────────────────
      const prevProgress = (newStreak.challengeProgress || {})[state.challenge?.id] ?? defaultProgress
      const updatedProgress = state.challenge
        ? sm2Update(prevProgress, score.totalScore)
        : prevProgress
      const newChallengeProgress = state.challenge
        ? { ...(newStreak.challengeProgress || {}), [state.challenge.id]: updatedProgress }
        : (newStreak.challengeProgress || {})

      const updatedSave = {
        ...newStreak,
        coins:              (newStreak.coins || 0) + finalCoins,
        xp:                 (newStreak.xp    || 0) + finalXp,
        totalTokensSaved:   (newStreak.totalTokensSaved || 0) + score.tokensSaved,
        completedChallenges: newCompleted,
        maxCombo,
        bossDefeated:       newStreak.bossDefeated || false,
        playerElo:          newElo,
        challengeProgress:  newChallengeProgress,
      }

      const newBadges = checkBadges(updatedSave, { ...score, comboBonus })
      updatedSave.badges = [...(updatedSave.badges || []), ...newBadges]

      // ── Certification check ─────────────────────────────────────────────
      const allAttempts   = loadArchive().attempts || []
      const liveAvgScore  = allAttempts.length
        ? Math.round(allAttempts.reduce((s, a) => s + (a.totalScore ?? 0), 0) / allAttempts.length)
        : Math.round(score.totalScore)
      const newCertTiers  = checkCertifications(
        { completedCount: newCompleted.length, avgScore: liveAvgScore },
        updatedSave.certifications || [],
      )
      const newCertRecords = newCertTiers.map(t => ({
        tierId:         t.id,
        name:           t.name,
        earnedAt:       new Date().toISOString(),
        avgScore:       liveAvgScore,
        completedCount: newCompleted.length,
      }))
      updatedSave.certifications = [...(updatedSave.certifications || []), ...newCertRecords]
      // ────────────────────────────────────────────────────────────────────

      writeSave(updatedSave)

      // ── Leaderboard snapshot ────────────────────────────────────────────
      addOrUpdateLeaderboard(buildSnapshot(updatedSave, allAttempts))
      // ────────────────────────────────────────────────────────────────────

      // ── Hidden training-data log (never shown to user) ──────────────────
      if (score._meta) {
        logAttempt({
          username:       state.username,
          challengeId:    score._meta.challengeId,
          challengeTitle: score._meta.challengeTitle,
          mode:           score._meta.mode,
          villain:        score._meta.villain,
          difficulty:     score._meta.difficulty,
          level:          score._meta.level,
          originalPrompt: score._meta.originalPrompt,
          userInput:      score._meta.userInput,       // raw text the user wrote
          correctAnswer:  score._meta.correctAnswer,   // ideal answer
          isCorrect:      score._meta.isCorrect,       // choose_best: T/F
          totalScore:     score.totalScore,
          grade:          score.grade,
          tokensSaved:    score.tokensSaved,
          coins:          finalCoins,
          xp:             finalXp,
          combo,
          newBadges,
        })
      }
      // ────────────────────────────────────────────────────────────────────

      set({
        ...updatedSave,
        combo,
        maxCombo,
        _lastEloDelta: eloDelta,
        lastScore: { ...score, comboBonus, finalCoins },
        newBadges,
        newCerts: newCertRecords,
        screen: 'results',
      })
    },

    submitBossRound(score, damage) {
      const state = get()
      const newHp = Math.max(0, state.bossHp - damage)
      const nextIdx = state.bossSeqIdx + 1

      if (newHp <= 0) {
        const save = loadSave()
        const updated = { ...save, bossDefeated: true }
        writeSave(updated)
        set({ bossHp: 0, bossDefeated: true, lastScore: score, screen: 'results' })
        return
      }

      if (nextIdx >= state.bossSequence.length) {
        set({ bossHp: newHp, lastScore: score, screen: 'results' })
        return
      }

      set({
        bossHp: newHp,
        bossSeqIdx: nextIdx,
        challenge: state.bossSequence[nextIdx],
        lastScore: score,
      })
    },

    nextChallenge() {
      const state = get()
      const remaining = challenges.filter(c => !state.completedChallenges.includes(c.id))
      if (remaining.length === 0) {
        set({ screen: 'levelMap' })
        return
      }
      const next = remaining[0]
      set({ challenge: next, screen: 'game', lastScore: null })
    },

    spendHint(cost) {
      const state = get()
      if (state.coins < cost) return false
      const updated = { ...loadSave(), coins: state.coins - cost }
      writeSave(updated)
      set({ coins: state.coins - cost })
      return true
    },

    setTheme(theme) {
      const save = loadSave()
      writeSave({ ...save, theme })
      document.body.className = `theme-${theme}`
      set({ theme })
    },

    toggleSound() {
      const state = get()
      const enabled = !state.soundEnabled
      const save = loadSave()
      writeSave({ ...save, soundEnabled: enabled })
      set({ soundEnabled: enabled })
    },

    // ── Username / session ──
    setUsername(name) {
      const trimmed = name.trim().slice(0, 20)
      if (!trimmed) return
      const save = loadSave()
      const now  = new Date().toISOString()
      const updated = {
        ...save,
        username: trimmed,
        joinedAt: save.joinedAt || now,
        sessions: (save.sessions || 0) + 1,
      }
      writeSave(updated)
      // Navigate to landing — LandingScreen will render WelcomeBack since username is set
      set({ username: trimmed, joinedAt: updated.joinedAt, sessions: updated.sessions, screen: 'landing' })
    },

    // ── Corporate employee registration ──
    setEmployee(name, team = null, company = null) {
      const trimmed = name.trim().slice(0, 50)
      if (!trimmed) return
      const save = loadSave()
      const now  = new Date().toISOString()
      const updated = {
        ...save,
        username:   trimmed,
        team:       team    || save.team    || null,
        company:    company || save.company || null,
        employeeId: save.employeeId || `emp_${Date.now()}`,
        joinedAt:   save.joinedAt || now,
        sessions:   (save.sessions || 0) + 1,
      }
      writeSave(updated)
      set({
        username:   updated.username,
        team:       updated.team,
        company:    updated.company,
        employeeId: updated.employeeId,
        joinedAt:   updated.joinedAt,
        sessions:   updated.sessions,
        screen:     'landing',
      })
    },

    // ── View a specific certificate ──
    viewCertificate(cert) {
      set({ _certToView: cert, screen: 'certificate' })
    },

    // Increment session counter when returning user resumes
    recordSession() {
      const save = loadSave()
      const updated = { ...save, sessions: (save.sessions || 0) + 1 }
      writeSave(updated)
      set({ sessions: updated.sessions })
    },

    resetProgress() {
      const save = loadSave()

      // ── Silently snapshot the full session before wiping ────────────────
      // User sees a clean slate; we keep everything for agent training.
      archiveSession({
        ...save,
        _resetAt:      new Date().toISOString(),
        _resetReason:  'user_initiated',
      })
      // ────────────────────────────────────────────────────────────────────

      // Preserve identity (including corporate fields), reset gameplay
      const fresh = {
        username:    save.username,
        joinedAt:    save.joinedAt,
        sessions:    save.sessions,
        soundEnabled: save.soundEnabled,
        theme:       save.theme,
        // ── Corporate identity — never wiped ──
        employeeId:     save.employeeId     || null,
        team:           save.team           || null,
        company:        save.company        || null,
        certifications: save.certifications || [],
        // ── Gameplay reset ──
        coins: 0, xp: 0, level: 1,
        completedChallenges: [], badges: [],
        streak: 0, lastPlayedDate: null,
        totalTokensSaved: 0, highScores: {},
        maxCombo: 0, bossDefeated: false,
        playerElo:         ELO_START,
        challengeProgress: {},
      }
      writeSave(fresh)
      set({ ...fresh, screen: 'landing', challenge: null, lastScore: null, combo: 0 })
    },

    getBadges() {
      return BADGES
    },

    getChallenges() {
      return challenges
    },
  }
})

export default useGameStore
