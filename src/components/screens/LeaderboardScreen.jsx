/**
 * LeaderboardScreen.jsx
 * Team leaderboard — all employees who have trained on this device.
 * Two tabs: All Employees | By Team
 * Sorted by Elo descending by default.
 */
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import useGameStore from '../../store/gameStore.js'
import { loadLeaderboard, getTeams } from '../../utils/leaderboard.js'
import { CERT_TIERS } from '../../data/certifications.js'
import { getEloRank } from '../../utils/elo.js'
import CertBadge from '../ui/CertBadge.jsx'
import EloChip from '../ui/EloChip.jsx'

const SORT_OPTIONS = [
  { value: 'elo',        label: 'Elo Rating'  },
  { value: 'score',      label: 'Avg Score'   },
  { value: 'challenges', label: 'Challenges'  },
  { value: 'tokens',     label: 'Tokens Saved'},
]

const RANK_MEDALS = ['🥇', '🥈', '🥉']

function getCertTier(highestCertTier) {
  return CERT_TIERS.find(t => t.level === highestCertTier) ?? null
}

function sortEntries(entries, sortBy) {
  return [...entries].sort((a, b) => {
    if (sortBy === 'elo')        return (b.playerElo ?? 0)        - (a.playerElo ?? 0)
    if (sortBy === 'score')      return (b.avgScore ?? 0)         - (a.avgScore ?? 0)
    if (sortBy === 'challenges') return (b.completedCount ?? 0)   - (a.completedCount ?? 0)
    if (sortBy === 'tokens')     return (b.totalTokensSaved ?? 0) - (a.totalTokensSaved ?? 0)
    return 0
  })
}

function EmployeeRow({ entry, rank }) {
  const certTier = getCertTier(entry.highestCertTier)
  const eloRank  = getEloRank(entry.playerElo ?? 1000)

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.04 }}
      className="card p-4 flex items-center gap-3 flex-wrap"
    >
      {/* Rank */}
      <div className="text-xl w-8 text-center shrink-0">
        {rank < 3 ? RANK_MEDALS[rank] : <span className="text-slate-600 font-mono text-sm">#{rank + 1}</span>}
      </div>

      {/* Identity */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm text-slate-100 font-mono truncate">{entry.username}</span>
          {entry.team && (
            <span className="text-xs font-mono px-2 py-0.5 rounded-full border border-neon-purple/30 bg-neon-purple/5 text-neon-purple">
              {entry.team}
            </span>
          )}
          {entry.company && (
            <span className="text-xs font-mono text-slate-600">{entry.company}</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs font-mono text-slate-500 flex-wrap">
          <span>✓ {entry.completedCount} challenges</span>
          <span>📈 {entry.avgScore}% avg</span>
          <span>💾 {(entry.totalTokensSaved ?? 0).toLocaleString()} tokens</span>
        </div>
      </div>

      {/* Elo chip */}
      <div className="shrink-0">
        <EloChip elo={entry.playerElo ?? 1000} size="sm" />
      </div>

      {/* Cert badge */}
      {certTier && (
        <div className="shrink-0">
          <CertBadge tier={certTier} size="xs" />
        </div>
      )}
    </motion.div>
  )
}

export default function LeaderboardScreen() {
  const { goTo } = useGameStore()
  const [tab,    setTab]    = useState('all')   // 'all' | 'team'
  const [sortBy, setSortBy] = useState('elo')
  const [teamFilter, setTeamFilter] = useState('all')

  const allEntries = useMemo(() => loadLeaderboard(), [])
  const teams      = useMemo(() => getTeams(),         [])

  const displayed = useMemo(() => {
    let entries = allEntries
    if (tab === 'team' && teamFilter !== 'all') {
      entries = entries.filter(e => e.team === teamFilter)
    }
    return sortEntries(entries, sortBy)
  }, [allEntries, tab, sortBy, teamFilter])

  // Team summary for "By Team" tab
  const teamSummaries = useMemo(() => {
    if (tab !== 'team') return []
    const map = {}
    allEntries.forEach(e => {
      const t = e.team || '(No Team)'
      if (!map[t]) map[t] = { team: t, members: 0, totalElo: 0, totalChallenges: 0, totalScore: 0 }
      map[t].members++
      map[t].totalElo        += (e.playerElo ?? 1000)
      map[t].totalChallenges += (e.completedCount ?? 0)
      map[t].totalScore      += (e.avgScore ?? 0)
    })
    return Object.values(map)
      .map(t => ({ ...t, avgElo: Math.round(t.totalElo / t.members), avgScore: Math.round(t.totalScore / t.members) }))
      .sort((a, b) => b.avgElo - a.avgElo)
  }, [allEntries, tab])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="relative z-10 min-h-screen px-4 py-8 max-w-2xl mx-auto"
    >
      {/* Back */}
      <button
        onClick={() => goTo('levelMap')}
        className="text-slate-500 hover:text-neon-blue text-sm mb-6 flex items-center gap-1 transition-colors"
      >
        ← Level Map
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-100 mb-1" style={{ fontFamily: 'Exo 2' }}>
          🏆 Leaderboard
        </h1>
        <p className="text-slate-500 text-sm font-mono">
          Showing all employees who have trained on this device.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: '👥', label: 'Employees',  value: allEntries.length },
          { icon: '🏢', label: 'Teams',      value: teams.length || '—'    },
          { icon: '🎓', label: 'Certs Earned', value: allEntries.reduce((s, e) => s + (e.certifications?.length ?? 0), 0) },
        ].map(({ icon, label, value }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-3 text-center"
          >
            <div className="text-xl mb-0.5">{icon}</div>
            <div className="font-black font-mono text-neon-blue">{value}</div>
            <div className="text-xs text-slate-600 font-mono">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[['all', '👤 All Employees'], ['team', '🏢 By Team']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2 rounded-xl text-sm font-mono font-bold border transition-all ${
              tab === key
                ? 'border-neon-blue/40 bg-neon-blue/10 text-neon-blue'
                : 'border-slate-800 text-slate-500 hover:border-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Sort */}
        <div className="flex gap-1.5 flex-wrap">
          {SORT_OPTIONS.map(o => (
            <button
              key={o.value}
              onClick={() => setSortBy(o.value)}
              className={`text-xs font-mono px-2.5 py-1 rounded-full border transition-all ${
                sortBy === o.value
                  ? 'border-neon-amber/40 bg-neon-amber/10 text-neon-amber'
                  : 'border-slate-800 text-slate-600 hover:border-slate-600'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Team filter (all tab) */}
        {tab === 'all' && teams.length > 0 && (
          <select
            value={teamFilter}
            onChange={e => setTeamFilter(e.target.value)}
            className="ml-auto text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 outline-none"
          >
            <option value="all">All Teams</option>
            {teams.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
      </div>

      {/* Empty state */}
      {displayed.length === 0 && (
        <div className="card p-10 text-center">
          <div className="text-4xl mb-3">🏆</div>
          <p className="text-slate-500 font-mono text-sm">No employees yet.</p>
          <p className="text-slate-700 font-mono text-xs mt-1">
            Complete a challenge to appear on the leaderboard.
          </p>
        </div>
      )}

      {/* ── All Employees view ── */}
      {tab === 'all' && displayed.length > 0 && (
        <div className="space-y-2">
          {displayed.map((entry, i) => (
            <EmployeeRow key={entry.employeeId ?? i} entry={entry} rank={i} />
          ))}
        </div>
      )}

      {/* ── By Team view ── */}
      {tab === 'team' && (
        <div className="space-y-4">
          {teamSummaries.map((t, i) => {
            const teamMembers = sortEntries(
              allEntries.filter(e => (e.team || '(No Team)') === t.team),
              sortBy,
            )
            return (
              <motion.div
                key={t.team}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="card overflow-hidden"
              >
                {/* Team header */}
                <div className="flex items-center justify-between px-4 py-3 bg-neon-blue/5 border-b border-neon-blue/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{RANK_MEDALS[i] ?? '🏅'}</span>
                    <span className="font-bold text-sm text-neon-blue font-mono">{t.team}</span>
                    <span className="text-xs text-slate-600 font-mono">{t.members} members</span>
                  </div>
                  <div className="flex gap-3 text-xs font-mono text-slate-500">
                    <span>⚡ avg {t.avgElo} Elo</span>
                    <span>📈 avg {t.avgScore}%</span>
                  </div>
                </div>
                {/* Team members */}
                <div className="divide-y divide-slate-800/50">
                  {teamMembers.map((entry, j) => (
                    <div key={entry.employeeId ?? j} className="px-4 py-3 flex items-center gap-3">
                      <span className="text-slate-600 font-mono text-xs w-4">{j + 1}</span>
                      <span className="flex-1 text-sm font-mono text-slate-200">{entry.username}</span>
                      <EloChip elo={entry.playerElo ?? 1000} size="xs" />
                      {getCertTier(entry.highestCertTier) && (
                        <CertBadge tier={getCertTier(entry.highestCertTier)} size="xs" />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}
          {teamSummaries.length === 0 && (
            <div className="card p-8 text-center text-slate-600 font-mono text-sm">
              No team data yet. Employees can add their team during registration.
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 flex gap-3">
        <button className="btn-primary flex-1" onClick={() => goTo('game')}>
          ⚡ Continue Training
        </button>
        <button className="btn-neon px-4" onClick={() => goTo('certifications')}>
          🎓 Certs
        </button>
      </div>
    </motion.div>
  )
}
