/**
 * CertificateViewScreen.jsx
 * Shows the certificate both in-app (white professional card) and on print.
 *
 * Layout:
 *   1. Toolbar (back / print buttons) — hidden on print
 *   2. In-app certificate (white card, always visible) — hidden on print
 *   3. Print-only certificate (identical content, triggered by window.print())
 */
import { motion } from 'framer-motion'
import useGameStore from '../../store/gameStore.js'
import { CERT_TIERS } from '../../data/certifications.js'
import { getEloRank } from '../../utils/elo.js'

// ── Shared stat data builder ─────────────────────────────────────────────────
function useStats(cert, totalTokensSaved, playerElo) {
  const rank = getEloRank(playerElo)
  return [
    { label: 'Challenges Completed', value: cert.completedCount },
    { label: 'Average Score',        value: `${cert.avgScore}%` },
    { label: 'Tokens Saved',         value: totalTokensSaved.toLocaleString() },
    { label: 'Elo Rating',           value: `${playerElo} · ${rank.label}` },
  ]
}

// ── In-app certificate card (white, professional) ────────────────────────────
function CertificateCard({ cert, tier, username, team, company, earnedDate, stats }) {
  const tierColorHex = tier.color

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ delay: 0.15 }}
      /* Outer frame — dark background with tier-coloured glow */
      style={{
        padding:      '3px',
        borderRadius: '16px',
        background:   `linear-gradient(135deg, ${tierColorHex}88, ${tierColorHex}22, ${tierColorHex}88)`,
        boxShadow:    `0 0 40px ${tierColorHex}33, 0 0 80px ${tierColorHex}11`,
      }}
    >
      {/* White certificate surface */}
      <div
        style={{
          background:   '#ffffff',
          borderRadius: '14px',
          overflow:     'hidden',
          fontFamily:   'Georgia, "Times New Roman", serif',
          color:        '#1e293b',
        }}
      >

        {/* ── Top colour bar ── */}
        <div style={{
          background:  `linear-gradient(90deg, #0f172a, ${tierColorHex}, #0f172a)`,
          padding:     '14px 28px',
          display:     'flex',
          alignItems:  'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>🤖</span>
            <div>
              <div style={{
                fontFamily:    '"Exo 2", Arial, sans-serif',
                fontWeight:    900,
                fontSize:      '16px',
                letterSpacing: '2px',
                color:         '#00d4ff',
              }}>
                TOKEN<span style={{ color: '#a855f7' }}>QUEST</span>
              </div>
              <div style={{
                fontFamily: 'monospace',
                fontSize:   '10px',
                color:      '#10b981',
                letterSpacing: '1px',
              }}>
                by ZeroTokens.ai
              </div>
            </div>
          </div>
          <div style={{
            fontFamily:    'monospace',
            fontSize:      '10px',
            color:         '#94a3b8',
            letterSpacing: '1px',
            textAlign:     'right',
          }}>
            AI PROMPT OPTIMISATION<br />TRAINING PROGRAMME
          </div>
        </div>

        {/* ── Certificate body ── */}
        <div style={{ padding: '36px 48px', textAlign: 'center', position: 'relative' }}>

          {/* Watermark */}
          <div style={{
            position:      'absolute',
            top:           '50%',
            left:          '50%',
            transform:     'translate(-50%, -50%)',
            fontSize:      '140px',
            opacity:       0.03,
            pointerEvents: 'none',
            userSelect:    'none',
            lineHeight:    1,
          }}>
            {tier.emoji}
          </div>

          {/* CERTIFICATE OF ACHIEVEMENT */}
          <div style={{
            fontFamily:    'Arial, sans-serif',
            fontSize:      '11px',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            color:         '#64748b',
            marginBottom:  '12px',
          }}>
            Certificate of Achievement
          </div>

          {/* Tier badge */}
          <div style={{
            display:       'inline-flex',
            alignItems:    'center',
            gap:           '8px',
            background:    tierColorHex + '14',
            border:        `2px solid ${tierColorHex}44`,
            borderRadius:  '32px',
            padding:       '6px 20px',
            marginBottom:  '20px',
          }}>
            <span style={{ fontSize: '20px' }}>{tier.emoji}</span>
            <span style={{
              fontFamily:  'Arial, sans-serif',
              fontWeight:  900,
              fontSize:    '16px',
              color:       tierColorHex,
              letterSpacing: '0.5px',
            }}>
              {tier.name}
            </span>
          </div>

          {/* Subtitle */}
          <div style={{
            fontSize:     '12px',
            color:        '#64748b',
            fontStyle:    'italic',
            marginBottom: '24px',
          }}>
            {tier.subtitle}
          </div>

          {/* Divider */}
          <div style={{
            border:        'none',
            borderTop:     `1px solid ${tierColorHex}44`,
            width:         '50%',
            margin:        '0 auto 20px',
          }} />

          {/* This certifies that */}
          <div style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', marginBottom: '10px' }}>
            This is to certify that
          </div>

          {/* Employee name */}
          <div style={{
            fontFamily:   'Georgia, serif',
            fontSize:     '38px',
            fontWeight:   'bold',
            color:        '#0f172a',
            marginBottom: '8px',
            letterSpacing: '0.5px',
            lineHeight:   1.1,
          }}>
            {username}
          </div>

          {/* Team + Company */}
          {(team || company) && (
            <div style={{
              fontFamily:   'monospace',
              fontSize:     '12px',
              color:        '#475569',
              marginBottom: '18px',
            }}>
              {[team && `Team: ${team}`, company && `Company: ${company}`].filter(Boolean).join('  ·  ')}
            </div>
          )}
          {!team && !company && <div style={{ marginBottom: '18px' }} />}

          {/* Statement */}
          <div style={{
            fontSize:     '13px',
            color:        '#334155',
            lineHeight:   1.8,
            maxWidth:     '480px',
            margin:       '0 auto 28px',
          }}>
            has successfully demonstrated competency in AI prompt optimisation
            by completing{' '}
            <strong style={{ color: tierColorHex }}>{cert.completedCount} challenges</strong>
            {' '}with an average score of{' '}
            <strong style={{ color: tierColorHex }}>{cert.avgScore}%</strong>.
          </div>

          {/* Stats row */}
          <div style={{
            display:       'flex',
            justifyContent:'center',
            border:        '1px solid #e2e8f0',
            borderRadius:  '8px',
            overflow:      'hidden',
            maxWidth:      '520px',
            margin:        '0 auto 24px',
          }}>
            {stats.map((s, i) => (
              <div
                key={s.label}
                style={{
                  flex:        1,
                  padding:     '14px 8px',
                  textAlign:   'center',
                  borderRight: i < stats.length - 1 ? '1px solid #e2e8f0' : 'none',
                }}
              >
                <div style={{
                  fontFamily:  'Arial, sans-serif',
                  fontWeight:  900,
                  fontSize:    '17px',
                  color:       tierColorHex,
                  marginBottom:'3px',
                }}>
                  {s.value}
                </div>
                <div style={{
                  fontFamily:    'monospace',
                  fontSize:      '9px',
                  color:         '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{
            border:    'none',
            borderTop: '1px solid #e2e8f0',
            width:     '60%',
            margin:    '0 auto 16px',
          }} />

          {/* Date */}
          <div style={{
            fontFamily:    'monospace',
            fontSize:      '11px',
            color:         '#94a3b8',
            letterSpacing: '1px',
          }}>
            Date Issued: {earnedDate}
          </div>
        </div>

        {/* ── Footer bar ── */}
        <div style={{
          background:    '#f8fafc',
          borderTop:     '1px solid #e2e8f0',
          padding:       '12px 28px',
          textAlign:     'center',
          fontFamily:    'monospace',
          fontSize:      '10px',
          color:         '#94a3b8',
          letterSpacing: '0.5px',
          lineHeight:    1.8,
        }}>
          <div>Token Quest by ZeroTokens.ai · AI Prompt Optimisation Training</div>
          <div>This certificate confirms successful completion of the {tier.name} training programme.</div>
        </div>

      </div>
    </motion.div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────
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

  const earnedDate = new Date(cert.earnedAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const rank  = getEloRank(playerElo)
  const stats = useStats(cert, totalTokensSaved, playerElo)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 min-h-screen px-4 py-8 max-w-3xl mx-auto"
    >
      {/* ── Toolbar — hidden on print ── */}
      <div className="no-print flex items-center justify-between mb-6 flex-wrap gap-3">
        <button
          onClick={() => goTo('certifications')}
          className="text-slate-500 hover:text-neon-blue text-sm flex items-center gap-1 transition-colors"
        >
          ← Certifications
        </button>
        <div className="flex gap-3">
          <button
            className="btn-primary text-sm px-5 py-2"
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

      {/* ── In-app certificate display — hidden on print ── */}
      <div className="no-print">
        <CertificateCard
          cert={cert}
          tier={tier}
          username={username}
          team={team}
          company={company}
          earnedDate={earnedDate}
          stats={stats}
        />

        {/* Share nudge */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-slate-600 font-mono mt-4"
        >
          🖨 Use "Print / Save PDF" to download a copy · Share it with your team!
        </motion.p>
      </div>

      {/* ── Print-only layer — shown only when window.print() is called ── */}
      <div className="certificate-print print-only">
        <div className="cert-print-inner">

          <div className="cert-header">
            <div className="cert-logo">🤖 TOKEN QUEST</div>
            <div className="cert-platform">by ZeroTokens.ai · AI Prompt Optimisation Training</div>
          </div>

          <div className="cert-body">
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
            <div className="cert-stats">
              {stats.map(s => (
                <div key={s.label} className="cert-stat">
                  <div className="cert-stat-value">{s.value}</div>
                  <div className="cert-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="cert-divider" />
            <div className="cert-date">Date Issued: {earnedDate}</div>
          </div>

          <div className="cert-footer">
            <div>Token Quest by ZeroTokens.ai · AI Prompt Optimisation Training</div>
            <div>This certificate confirms successful completion of the {tier.name} training programme.</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
