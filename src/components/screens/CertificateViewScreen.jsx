/**
 * CertificateViewScreen.jsx
 * Full-page certificate — two layers:
 *   Screen: dark neon preview (game design)
 *   Print:  white, clean, professional (via @media print CSS in index.css)
 *
 * The `.certificate-print` div is the only thing shown when printing.
 */
import { motion } from 'framer-motion'
import useGameStore from '../../store/gameStore.js'
import { CERT_TIERS } from '../../data/certifications.js'
import { getEloRank } from '../../utils/elo.js'

export default function CertificateViewScreen() {
  const {
    goTo,
    _certToView,
    username, team, company,
    playerElo = 1000,
    totalTokensSaved = 0,
  } = useGameStore()

  const cert = _certToView
  const tier = cert ? CERT_TIERS.find(t => t.id === cert.tierId) : null

  if (!cert || !tier) {
    return (
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">🎓</div>
          <p className="text-slate-400 mb-4">No certificate selected.</p>
          <button className="btn-primary" onClick={() => goTo('certifications')}>← Back to Certifications</button>
        </div>
      </div>
    )
  }

  const rank       = getEloRank(playerElo)
  const earnedDate = new Date(cert.earnedAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 min-h-screen px-4 py-8 max-w-3xl mx-auto no-print-wrapper"
    >
      {/* Toolbar — hidden on print */}
      <div className="no-print flex items-center justify-between mb-6 flex-wrap gap-3">
        <button
          onClick={() => goTo('certifications')}
          className="text-slate-500 hover:text-neon-blue text-sm flex items-center gap-1 transition-colors"
        >
          ← Certifications
        </button>
        <div className="flex gap-3">
          <button
            className="btn-neon text-sm px-4 py-2"
            onClick={() => window.print()}
          >
            🖨 Print / Save PDF
          </button>
          <button
            className="btn-neon text-sm px-4 py-2"
            onClick={() => goTo('leaderboard')}
          >
            🏆 Leaderboard
          </button>
        </div>
      </div>

      {/* ── Screen preview (neon dark) ── */}
      <motion.div
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1,    opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="no-print card p-8 text-center relative overflow-hidden"
        style={{ borderColor: tier.borderColor, background: tier.bgColor }}
      >
        {/* Corner watermark */}
        <div className="absolute -right-6 -top-6 text-9xl opacity-5 pointer-events-none select-none">
          {tier.emoji}
        </div>
        <div className="absolute -left-6 -bottom-6 text-9xl opacity-5 pointer-events-none select-none rotate-180">
          {tier.emoji}
        </div>

        {/* Logo row */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-2xl">🤖</span>
          <span
            className="font-black text-xl tracking-wider neon-text"
            style={{ fontFamily: 'Exo 2', color: '#00d4ff' }}
          >
            TOKEN<span style={{ color: '#a855f7' }}>QUEST</span>
          </span>
        </div>

        {/* Certificate type */}
        <p className="text-xs uppercase tracking-widest text-slate-500 font-mono mb-2">
          Certificate of Achievement
        </p>
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-4xl">{tier.emoji}</span>
          <h2 className="text-2xl font-black" style={{ fontFamily: 'Exo 2', color: tier.color }}>
            {tier.name}
          </h2>
        </div>

        {/* Divider */}
        <div className="w-24 h-px mx-auto mb-6" style={{ background: tier.color + '55' }} />

        {/* "This certifies that" */}
        <p className="text-slate-500 text-sm font-mono mb-3">This certifies that</p>

        {/* Employee name — LARGE */}
        <h1
          className="text-4xl font-black mb-2"
          style={{ fontFamily: 'Exo 2', color: '#f1f5f9' }}
        >
          {username}
        </h1>

        {/* Team + Company */}
        {(team || company) && (
          <p className="text-sm font-mono text-slate-400 mb-6">
            {[team, company].filter(Boolean).join(' · ')}
          </p>
        )}
        {!team && !company && <div className="mb-6" />}

        {/* Description */}
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
          has demonstrated proficiency in AI prompt optimisation, completing{' '}
          <span style={{ color: tier.color }}>{cert.completedCount} challenges</span>{' '}
          with an average score of{' '}
          <span style={{ color: tier.color }}>{cert.avgScore}%</span>.
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: '🎯', label: 'Challenges',    value: cert.completedCount },
            { icon: '📈', label: 'Avg Score',     value: `${cert.avgScore}%` },
            { icon: '💾', label: 'Tokens Saved',  value: totalTokensSaved.toLocaleString() },
            { icon: rank.emoji, label: 'Elo Rank', value: playerElo },
          ].map(({ icon, label, value }) => (
            <div key={label} className="card p-3 text-center">
              <div className="text-lg mb-0.5">{icon}</div>
              <div className="font-bold font-mono text-sm" style={{ color: tier.color }}>{value}</div>
              <div className="text-xs text-slate-600 font-mono">{label}</div>
            </div>
          ))}
        </div>

        {/* Date */}
        <p className="text-xs text-slate-600 font-mono">Issued {earnedDate}</p>
        <p className="text-xs text-slate-700 font-mono mt-1">TokenQuest Corporate Training Platform</p>
      </motion.div>

      {/* ── Print-only layer (white, clean, professional) ── */}
      <div className="certificate-print print-only" style={{ display: 'none' }}>
        <div className="cert-print-inner">

          {/* Header bar */}
          <div className="cert-header">
            <div className="cert-logo">🤖 TOKENQUEST</div>
            <div className="cert-platform">AI Prompt Optimisation Training Platform</div>
          </div>

          <div className="cert-body">
            {/* Title */}
            <div className="cert-achievement-label">CERTIFICATE OF ACHIEVEMENT</div>
            <div className="cert-tier-badge">{tier.emoji} {tier.name.toUpperCase()}</div>
            <div className="cert-subtitle">{tier.subtitle}</div>

            <div className="cert-divider" />

            <div className="cert-certifies">This is to certify that</div>

            <div className="cert-name">{username}</div>

            {(team || company) && (
              <div className="cert-identity">
                {[team && `Team: ${team}`, company && `Company: ${company}`].filter(Boolean).join('  ·  ')}
              </div>
            )}

            <div className="cert-statement">
              has successfully demonstrated competency in AI prompt optimisation by completing{' '}
              <strong>{cert.completedCount} challenges</strong> with an average score of{' '}
              <strong>{cert.avgScore}%</strong>.
            </div>

            {/* Stats row */}
            <div className="cert-stats">
              <div className="cert-stat">
                <div className="cert-stat-value">{cert.completedCount}</div>
                <div className="cert-stat-label">Challenges Completed</div>
              </div>
              <div className="cert-stat">
                <div className="cert-stat-value">{cert.avgScore}%</div>
                <div className="cert-stat-label">Average Score</div>
              </div>
              <div className="cert-stat">
                <div className="cert-stat-value">{totalTokensSaved.toLocaleString()}</div>
                <div className="cert-stat-label">Tokens Saved</div>
              </div>
              <div className="cert-stat">
                <div className="cert-stat-value">{playerElo}</div>
                <div className="cert-stat-label">Elo Rating</div>
              </div>
            </div>

            <div className="cert-divider" />

            <div className="cert-date">Date Issued: {earnedDate}</div>
          </div>

          {/* Footer */}
          <div className="cert-footer">
            <div>TokenQuest Corporate Training · AI Prompt Optimisation</div>
            <div>This certificate confirms successful completion of the {tier.name} training programme.</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
