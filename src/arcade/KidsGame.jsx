/**
 * KidsGame.jsx — Token Bubble Pop (Kindergarten – Grade 5)
 *
 * Gameplay: Cute blob enemies float down inside glowing bubbles, trying to
 * eat tokens. Player is a tiny astronaut at the bottom who AUTO-FIRES a
 * rainbow beam upward. Move left/right to aim. Pop the bubbles before they
 * reach the ground. Collect gold ₮ coins that fly out of popped blobs.
 *
 * Completely different from the 6-12 sword fighter — no manual attacks,
 * no dodge, no energy bar. Just move + auto-shoot.
 */
import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Canvas ─────────────────────────────────────────────────────────────────────
const W = 800, H = 540
const FLOOR_Y = H - 58   // y where blobs "land" and eat your tokens

// ── Helpers ────────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2) }

const ENCOURAGEMENTS = ['AMAZING! ⭐', 'SUPER! 🌟', 'FANTASTIC! 💫', 'WOW! 🎉', 'GREAT JOB! 🏆', 'AWESOME! ✨']

// ── Blob enemy definitions ─────────────────────────────────────────────────────
const BLOB_DEFS = {
  pink:   { color: '#ff88cc', eye: '#990055', hp: 1, reward: 10, spd: 52,  r: 34 },
  blue:   { color: '#66bbff', eye: '#003399', hp: 2, reward: 20, spd: 38,  r: 44 },
  yellow: { color: '#ffee55', eye: '#775500', hp: 1, reward: 15, spd: 72,  r: 28 },
  green:  { color: '#66ee88', eye: '#005522', hp: 1, reward: 12, spd: 60,  r: 32 },
  boss:   { color: '#ee44bb', eye: '#880033', hp: 6, reward: 100, spd: 30, r: 68 },
}

function makeBlob(type, wave) {
  const def = BLOB_DEFS[type]
  const extraHp = Math.floor(wave / 4)
  return {
    id: uid(), type,
    x: def.r + 20 + Math.random() * (W - def.r * 2 - 40),
    y: -def.r - 10,
    r: def.r,
    hp: def.hp + extraHp,
    maxHp: def.hp + extraHp,
    speed: def.spd * (1 + wave * 0.04),
    color: def.color, eye: def.eye,
    reward: def.reward,
    wobblePhase: Math.random() * Math.PI * 2,
    hitFlash: 0,
    scared: 0,
    mouthOpen: 0,
    dying: false, dieTimer: 0,
    origR: def.r,
  }
}

function makeToken(x, y) {
  const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2
  const spd = 90 + Math.random() * 100
  return { id: uid(), x, y, vx: Math.cos(a) * spd * 0.35, vy: Math.sin(a) * spd - 60, collected: false, life: 1 }
}

function makePart(x, y, vx, vy, color, size, life) {
  return { id: uid(), x, y, vx, vy, color, size, life, maxLife: life }
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function KidsGame({ onExit }) {
  const cvs  = useRef(null)
  const gs   = useRef(null)
  const keys = useRef({})
  const raf  = useRef(null)
  const last = useRef(null)

  const [phase, setPhase]         = useState('playing')
  const [hud, setHud]             = useState({ hp: 5, score: 0, wave: 1 })
  const [popMsg, setPopMsg]       = useState('')
  const [waveBanner, setWaveBanner] = useState('')
  const popTimer = useRef(null)

  // Colourful stars — their hue drifts with x position
  const stars = useRef(
    Array.from({ length: 70 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 2 + 0.4, b: Math.random(),
      drift: (Math.random() - 0.5) * 0.2,
    }))
  )

  // ── Wave queue ───────────────────────────────────────────────────────────────
  function buildWave(wave) {
    const q = []
    const n = 4 + wave * 2
    const types = Object.keys(BLOB_DEFS).filter(t => t !== 'boss')
    for (let i = 0; i < n; i++) {
      let type = 'pink'
      if (wave >= 2 && i % 4 === 0) type = 'blue'
      if (wave >= 3 && i % 5 === 0) type = 'yellow'
      if (wave >= 4 && i % 6 === 0) type = 'green'
      q.push({ type, delay: 1.8 + i * 1.5 })
    }
    if (wave % 4 === 0) q.push({ type: 'boss', delay: n * 1.5 + 2.5 })
    return q
  }

  // ── Init ─────────────────────────────────────────────────────────────────────
  function initGame() {
    gs.current = {
      player: {
        x: W / 2,
        speed: 290,
        hp: 5, maxHp: 5,
        score: 0,
        beams: [],
        beamTimer: 0,
        beamRate: 0.32,
        invTimer: 0,
        trail: [],
      },
      blobs: [], tokens: [], particles: [],
      wave: 1,
      spawnQ: buildWave(1),
      wavePhase: 'intro',
      waveTimer: 2.8,
    }
    last.current = null
    raf.current = requestAnimationFrame(loop)
  }

  function loop(ts) {
    if (!last.current) last.current = ts
    const dt = Math.min((ts - last.current) / 1000, 0.05)
    last.current = ts
    if (gs.current) { update(dt); draw() }
    raf.current = requestAnimationFrame(loop)
  }

  // ── Update ───────────────────────────────────────────────────────────────────
  function update(dt) {
    const g = gs.current
    const p = g.player
    const k = keys.current

    // Wave state machine
    if (g.wavePhase === 'intro') {
      g.waveTimer -= dt
      if (g.waveTimer <= 0) g.wavePhase = 'fighting'
    }

    if (g.wavePhase === 'fighting') {
      if (g.spawnQ.length > 0) {
        g.spawnQ[0].delay -= dt
        if (g.spawnQ[0].delay <= 0) {
          g.blobs.push(makeBlob(g.spawnQ.shift().type, g.wave))
        }
      }
      if (g.spawnQ.length === 0 && g.blobs.length === 0) {
        g.wavePhase = 'clear'
        g.waveTimer = 2.8
        p.hp = Math.min(p.maxHp, p.hp + 1)
        const bonus = g.wave * 30
        p.score += bonus
        setWaveBanner(`🌟 Wave ${g.wave} done! +${bonus} tokens!`)
        setHud(h => ({ ...h, hp: p.hp, score: p.score }))
      }
    }

    if (g.wavePhase === 'clear') {
      g.waveTimer -= dt
      if (g.waveTimer <= 0) {
        g.wave++
        g.spawnQ = buildWave(g.wave)
        g.wavePhase = 'intro'
        g.waveTimer = 2.2
        setWaveBanner('')
        setHud(h => ({ ...h, wave: g.wave }))
      }
    }

    // Player move
    if (k['ArrowLeft'] || k['a'] || k['A']) p.x = Math.max(32, p.x - p.speed * dt)
    if (k['ArrowRight'] || k['d'] || k['D']) p.x = Math.min(W - 32, p.x + p.speed * dt)

    // Auto-fire rainbow beam
    p.beamTimer += dt
    if (p.beamTimer >= p.beamRate) {
      p.beamTimer = 0
      p.beams.push({ id: uid(), x: p.x, y: FLOOR_Y - 28, vy: -520, hue: (Date.now() / 8) % 360, life: 1 })
    }

    // Update beams
    for (let i = p.beams.length - 1; i >= 0; i--) {
      const b = p.beams[i]
      b.y += b.vy * dt
      b.life -= dt * 1.8
      if (b.y < 0 || b.life <= 0) { p.beams.splice(i, 1); continue }

      // Check blob collision
      let hit = false
      for (let j = g.blobs.length - 1; j >= 0; j--) {
        const blob = g.blobs[j]
        if (blob.dying) continue
        if (Math.hypot(b.x - blob.x, b.y - blob.y) < blob.r + 8) {
          blob.hp--
          blob.hitFlash = 0.16
          blob.scared = 0.55
          spawnSparks(g, b.x, b.y, blob.color, 6)
          p.beams.splice(i, 1)
          hit = true

          if (blob.hp <= 0) {
            blob.dying = true
            p.score += blob.reward
            // Drop token coins
            const coinCount = blob.type === 'boss' ? 8 : 2
            for (let c = 0; c < coinCount; c++) g.tokens.push(makeToken(blob.x, blob.y))
            // Big colourful explosion
            for (let s = 0; s < 22; s++) {
              const a = Math.random() * Math.PI * 2
              const spd = 70 + Math.random() * 160
              g.particles.push(makePart(blob.x, blob.y, Math.cos(a) * spd, Math.sin(a) * spd - 50, blob.color, 5 + Math.random() * 5, 0.65))
            }
            for (let s = 0; s < 10; s++) {
              const a = Math.random() * Math.PI * 2
              g.particles.push(makePart(blob.x, blob.y, Math.cos(a) * 110, Math.sin(a) * 110 - 55, '#ffffff', 3 + Math.random() * 3, 0.5))
            }
            showPopMsg(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)])
          }
          break
        }
        if (hit) break
      }
    }

    // Update blobs
    for (let i = g.blobs.length - 1; i >= 0; i--) {
      const e = g.blobs[i]
      if (e.dying) {
        e.dieTimer += dt
        e.r += dt * 22
        if (e.dieTimer > 0.4) g.blobs.splice(i, 1)
        continue
      }
      if (e.hitFlash > 0) e.hitFlash -= dt
      if (e.scared > 0) e.scared -= dt

      e.wobblePhase += dt * 1.4
      e.x += Math.sin(e.wobblePhase) * 0.7
      e.x = Math.max(e.r + 5, Math.min(W - e.r - 5, e.x))
      e.y += e.speed * dt
      e.mouthOpen = Math.max(0, (e.y - (H - 200)) / 200)

      // Reached floor → eats a token → lose heart
      if (e.y > FLOOR_Y + e.r * 0.5) {
        p.hp--
        p.invTimer = 1.4
        // NOM explosion
        for (let s = 0; s < 14; s++) {
          const a = Math.random() * Math.PI * 2
          g.particles.push(makePart(e.x, FLOOR_Y, Math.cos(a) * 90, Math.sin(a) * 90 - 70, '#ff4455', 7, 0.5))
        }
        g.blobs.splice(i, 1)
        setHud(h => ({ ...h, hp: p.hp }))
        if (p.hp <= 0) {
          cancelAnimationFrame(raf.current)
          setPhase('gameover')
        }
        continue
      }
    }

    // Tokens — gravity + collect
    for (let i = g.tokens.length - 1; i >= 0; i--) {
      const t = g.tokens[i]
      if (t.collected) { t.life -= dt * 3; if (t.life <= 0) g.tokens.splice(i, 1); continue }
      t.vy += 210 * dt
      t.y += t.vy * dt
      t.x += t.vx * dt
      t.vx *= 0.97
      if (t.y > FLOOR_Y - 10) { t.y = FLOOR_Y - 10; t.vy *= -0.35 }
      // Player collects by proximity
      if (Math.hypot(t.x - p.x, t.y - FLOOR_Y) < 55) {
        t.collected = true
        p.score += 5
        spawnSparks(g, t.x, t.y, '#ffd700', 3)
      }
    }

    // Particles
    for (let i = g.particles.length - 1; i >= 0; i--) {
      const pt = g.particles[i]
      pt.x += pt.vx * dt; pt.y += pt.vy * dt
      pt.vy += 130 * dt
      pt.life -= dt / pt.maxLife
      if (pt.life <= 0) g.particles.splice(i, 1)
    }

    // Stars twinkle + drift
    stars.current.forEach(s => {
      s.b = Math.max(0.2, Math.min(1, s.b + (Math.random() - 0.5) * 0.07))
      s.x += s.drift
      if (s.x > W) s.x = 0; if (s.x < 0) s.x = W
    })

    if (p.invTimer > 0) p.invTimer -= dt
    setHud({ hp: p.hp, score: p.score, wave: g.wave })
  }

  function spawnSparks(g, x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const s = 40 + Math.random() * 90
      g.particles.push(makePart(x, y, Math.cos(a) * s, Math.sin(a) * s - 20, color, 3 + Math.random() * 3, 0.3))
    }
  }

  function showPopMsg(msg) {
    setPopMsg(msg)
    if (popTimer.current) clearTimeout(popTimer.current)
    popTimer.current = setTimeout(() => setPopMsg(''), 1100)
  }

  // ── Draw ─────────────────────────────────────────────────────────────────────
  function draw() {
    const canvas = cvs.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const g = gs.current, p = g.player

    // Bright gradient background
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, '#0e082a'); bg.addColorStop(0.6, '#180a2e'); bg.addColorStop(1, '#0a1225')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

    // Colourful twinkling stars
    stars.current.forEach(s => {
      const hue = (s.x / W * 280 + 60) % 360
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${hue},85%,85%,${s.b})`; ctx.fill()
    })

    // Horizon rainbow shimmer
    const shimmer = ctx.createLinearGradient(0, 0, W, 0)
    ;['#ff88cc', '#ffcc44', '#88ffcc', '#88aaff', '#cc88ff'].forEach((c, i, arr) => shimmer.addColorStop(i / (arr.length - 1), c + '18'))
    ctx.fillStyle = shimmer; ctx.fillRect(0, 0, W, 4)

    // Floor
    drawFloor(ctx)

    // Tokens
    g.tokens.forEach(t => drawToken(ctx, t))

    // Blobs (sorted far→near by y)
    ;[...g.blobs].sort((a, b) => a.y - b.y).forEach(b => drawBlob(ctx, b))

    // Beams
    p.beams.forEach(b => {
      ctx.save(); ctx.globalAlpha = b.life * 0.92
      const h1 = b.hue, h2 = (b.hue + 120) % 360
      const gr = ctx.createLinearGradient(b.x, b.y, b.x, 0)
      gr.addColorStop(0, `hsl(${h1},100%,70%)`); gr.addColorStop(1, `hsl(${h2},100%,70%)`)
      ctx.strokeStyle = gr; ctx.lineWidth = 7; ctx.shadowColor = `hsl(${h1},100%,65%)`; ctx.shadowBlur = 18
      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x, 0); ctx.stroke()
      ctx.restore()
    })

    // Player
    drawPlayer(ctx, p)

    // Particles (star-shaped)
    g.particles.forEach(pt => {
      ctx.save(); ctx.globalAlpha = Math.max(0, pt.life)
      ctx.shadowColor = pt.color; ctx.shadowBlur = 10; ctx.fillStyle = pt.color
      drawStar5(ctx, pt.x, pt.y, pt.size)
      ctx.restore()
    })

    // Wave intro banner (canvas)
    if (g.wavePhase === 'intro' && g.waveTimer > 0) {
      ctx.save(); ctx.globalAlpha = Math.min(1, g.waveTimer * 0.75)
      ctx.font = 'bold 44px "Exo 2", sans-serif'; ctx.textAlign = 'center'
      ctx.shadowColor = '#ffcc00'; ctx.shadowBlur = 30; ctx.fillStyle = '#ffffff'
      ctx.fillText(`🌟 WAVE ${g.wave} 🌟`, W / 2, H / 2 - 22)
      ctx.font = 'bold 19px "Exo 2", sans-serif'; ctx.shadowColor = '#ff88cc'; ctx.shadowBlur = 15
      ctx.fillStyle = '#ffccee'
      const hint = g.wave % 4 === 0 ? '⚠ BOSS incoming! Stay sharp!' : 'Pop the bubbles — save the ₮ tokens!'
      ctx.fillText(hint, W / 2, H / 2 + 14)
      ctx.restore()
    }
  }

  function drawFloor(ctx) {
    const grad = ctx.createLinearGradient(0, FLOOR_Y - 2, 0, H)
    grad.addColorStop(0, '#220a33'); grad.addColorStop(1, '#0d0520')
    ctx.fillStyle = grad; ctx.fillRect(0, FLOOR_Y - 2, W, H - FLOOR_Y + 2)

    // Coloured vertical slices on floor
    const cols = ['#ff88cc', '#88ccff', '#ffee55', '#88ffbb', '#cc88ff']
    for (let i = 0; i < W; i += 48) {
      ctx.strokeStyle = cols[Math.floor(i / 48) % cols.length] + '3a'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(i, FLOOR_Y); ctx.lineTo(i, H); ctx.stroke()
    }

    // Glowing top edge
    const edge = ctx.createLinearGradient(0, FLOOR_Y - 4, 0, FLOOR_Y + 4)
    edge.addColorStop(0, 'transparent'); edge.addColorStop(0.5, '#ff88cc66'); edge.addColorStop(1, 'transparent')
    ctx.fillStyle = edge; ctx.fillRect(0, FLOOR_Y - 4, W, 8)
  }

  function drawBlob(ctx, e) {
    ctx.save()
    if (e.dying) ctx.globalAlpha = Math.max(0, 1 - e.dieTimer / 0.4)
    else if (e.hitFlash > 0) ctx.globalAlpha = 0.45 + Math.abs(Math.sin(e.hitFlash * 38)) * 0.55

    // Bubble
    ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 9, 0, Math.PI * 2)
    const bub = ctx.createRadialGradient(e.x - e.r * 0.3, e.y - e.r * 0.3, 0, e.x, e.y, e.r + 9)
    bub.addColorStop(0, 'rgba(255,255,255,0.14)'); bub.addColorStop(0.7, 'rgba(255,255,255,0.04)'); bub.addColorStop(1, 'rgba(255,255,255,0.28)')
    ctx.fillStyle = bub; ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 2.5; ctx.stroke()

    // Body
    ctx.shadowColor = e.color; ctx.shadowBlur = 14
    const body = ctx.createRadialGradient(e.x - e.r * 0.22, e.y - e.r * 0.22, e.r * 0.08, e.x, e.y, e.r)
    body.addColorStop(0, lighten(e.color, 40)); body.addColorStop(1, e.color)
    ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2)
    ctx.fillStyle = body; ctx.fill()

    const eyeY = e.y - e.r * 0.22

    if (e.scared > 0) {
      // Scared X eyes
      ctx.strokeStyle = e.eye; ctx.lineWidth = 2.5; ctx.shadowBlur = 10; ctx.shadowColor = e.eye
      const er = e.r * 0.15
      ;[-0.28, 0.1].forEach(ox => {
        const ex = e.x + e.r * ox, ey2 = eyeY
        ctx.beginPath(); ctx.moveTo(ex - er, ey2 - er); ctx.lineTo(ex + er, ey2 + er); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(ex + er, ey2 - er); ctx.lineTo(ex - er, ey2 + er); ctx.stroke()
      })
    } else {
      // Happy round eyes
      ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 8; ctx.fillStyle = '#ffffff'
      ctx.beginPath(); ctx.arc(e.x - e.r * 0.27, eyeY, e.r * 0.19, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(e.x + e.r * 0.12, eyeY, e.r * 0.19, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = e.eye; ctx.shadowBlur = 0
      ctx.beginPath(); ctx.arc(e.x - e.r * 0.24, eyeY, e.r * 0.09, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(e.x + e.r * 0.15, eyeY, e.r * 0.09, 0, Math.PI * 2); ctx.fill()
    }

    // Mouth
    const mY = e.y + e.r * (0.2 + e.mouthOpen * 0.12)
    ctx.strokeStyle = e.eye; ctx.lineWidth = 2.5; ctx.shadowBlur = 0
    ctx.beginPath()
    if (e.mouthOpen > 0.3) {
      ctx.arc(e.x, mY - e.r * 0.06, e.r * 0.38, 0, Math.PI)
    } else {
      ctx.arc(e.x, mY, e.r * 0.32, 0, Math.PI)
    }
    ctx.stroke()

    // HP pips
    if (e.maxHp > 1) {
      for (let h = 0; h < e.maxHp; h++) {
        ctx.beginPath(); ctx.arc(e.x - (e.maxHp - 1) * 7 + h * 14, e.y - e.r - 16, 5.5, 0, Math.PI * 2)
        ctx.fillStyle = h < e.hp ? e.color : '#222'
        ctx.shadowBlur = h < e.hp ? 8 : 0; ctx.shadowColor = e.color; ctx.fill()
      }
    }

    // ₮ on chest
    ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(0,0,0,0.28)'
    ctx.font = `bold ${Math.max(10, e.r * 0.52)}px "JetBrains Mono", monospace`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('₮', e.x, e.y + e.r * 0.14)
    ctx.textBaseline = 'alphabetic'

    ctx.restore()
  }

  function drawToken(ctx, t) {
    ctx.save(); if (t.collected) ctx.globalAlpha = Math.max(0, t.life)
    ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 16
    ctx.beginPath(); ctx.arc(t.x, t.y, 10, 0, Math.PI * 2); ctx.fillStyle = '#ffd700'; ctx.fill()
    const shine = ctx.createRadialGradient(t.x - 3, t.y - 3, 1, t.x, t.y, 10)
    shine.addColorStop(0, 'rgba(255,255,255,0.5)'); shine.addColorStop(1, 'transparent')
    ctx.fillStyle = shine; ctx.fill()
    ctx.shadowBlur = 0; ctx.fillStyle = '#5a3500'
    ctx.font = 'bold 8px "JetBrains Mono",monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('₮', t.x, t.y); ctx.textBaseline = 'alphabetic'
    ctx.restore()
  }

  function drawPlayer(ctx, p) {
    const x = p.x, y = FLOOR_Y, r = 24
    ctx.save()
    if (p.invTimer > 0 && Math.floor(p.invTimer * 9) % 2 === 0) ctx.globalAlpha = 0.25

    // Shadow
    ctx.beginPath(); ctx.ellipse(x, y, r * 1.05, r * 0.18, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0,0,0,0.38)'; ctx.fill()

    // Suit body
    ctx.shadowColor = '#66aaff'; ctx.shadowBlur = 18
    ctx.fillStyle = '#3366bb'
    ctx.beginPath(); ctx.ellipse(x, y - r * 0.55, r * 0.68, r * 0.7, 0, 0, Math.PI * 2); ctx.fill()

    // Helmet
    ctx.fillStyle = '#cce6ff'
    ctx.beginPath(); ctx.arc(x, y - r * 1.48, r * 0.74, 0, Math.PI * 2); ctx.fill()

    // Visor
    ctx.shadowColor = '#99ccff'; ctx.shadowBlur = 14; ctx.fillStyle = '#7799ee'
    ctx.beginPath(); ctx.arc(x, y - r * 1.48, r * 0.52, Math.PI * 0.14, Math.PI * 0.86); ctx.fill()

    // Eyes
    ctx.shadowBlur = 0; ctx.fillStyle = '#fff'
    ctx.beginPath(); ctx.arc(x - r * 0.17, y - r * 1.53, r * 0.12, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(x + r * 0.17, y - r * 1.53, r * 0.12, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#001133'
    ctx.beginPath(); ctx.arc(x - r * 0.15, y - r * 1.52, r * 0.055, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(x + r * 0.19, y - r * 1.52, r * 0.055, 0, Math.PI * 2); ctx.fill()

    // Arm with cannon
    ctx.shadowColor = '#66aaff'; ctx.shadowBlur = 8; ctx.fillStyle = '#2255aa'
    ctx.fillRect(x + r * 0.62, y - r * 0.95, r * 0.55, r * 0.22)
    ctx.shadowColor = '#00ffcc'; ctx.shadowBlur = 18; ctx.fillStyle = '#00ffcc'
    ctx.beginPath(); ctx.arc(x + r * 1.2, y - r * 0.84, r * 0.16, 0, Math.PI * 2); ctx.fill()

    ctx.restore()
  }

  function drawStar5(ctx, x, y, r) {
    ctx.beginPath()
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5 - Math.PI / 2
      const radius = i % 2 === 0 ? r : r / 2.2
      i === 0 ? ctx.moveTo(x + Math.cos(a) * radius, y + Math.sin(a) * radius)
               : ctx.lineTo(x + Math.cos(a) * radius, y + Math.sin(a) * radius)
    }
    ctx.closePath(); ctx.fill()
  }

  function lighten(hex, amount) {
    const n = parseInt(hex.slice(1), 16)
    const r = Math.min(255, (n >> 16) + amount)
    const g = Math.min(255, ((n >> 8) & 0xff) + amount)
    const b = Math.min(255, (n & 0xff) + amount)
    return `rgb(${r},${g},${b})`
  }

  // ── Input ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = e => { keys.current[e.key] = e.type === 'keydown' }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKey)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey) }
  }, [])

  const handleVBtn = useCallback((key, down) => { keys.current[key] = down }, [])

  useEffect(() => {
    initGame()
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [])

  const restartGame = () => {
    if (raf.current) cancelAnimationFrame(raf.current)
    setPhase('playing'); setPopMsg(''); setWaveBanner('')
    initGame()
  }

  // ── JSX ───────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center select-none"
      style={{ background: 'radial-gradient(ellipse at center, #0e082a 0%, #040010 100%)' }}>

      {/* HUD */}
      <div className="w-full max-w-3xl flex items-center justify-between px-3 py-2" style={{ fontFamily: '"Exo 2", sans-serif' }}>
        <div className="flex items-center gap-1">
          {Array.from({ length: hud.hp }).map((_, i) => <span key={i} className="text-2xl" style={{ filter: 'drop-shadow(0 0 6px #ff4488)' }}>❤️</span>)}
          {Array.from({ length: Math.max(0, 5 - hud.hp) }).map((_, i) => <span key={i} className="text-2xl opacity-15">❤️</span>)}
        </div>
        <div className="font-black text-xl text-white" style={{ textShadow: '0 0 14px #ffcc00' }}>
          🌟 WAVE {hud.wave}
        </div>
        <div className="font-black text-lg" style={{ color: '#ffd700', textShadow: '0 0 10px #ffaa00' }}>
          ₮ {hud.score} saved!
        </div>
      </div>

      {/* Canvas */}
      <div className="relative" style={{ border: '2px solid #ff88cc44', boxShadow: '0 0 50px #ff88cc18, 0 0 100px #8866ff10' }}>
        <canvas ref={cvs} width={W} height={H} className="block" />

        {/* Encouragement pop */}
        <AnimatePresence>
          {popMsg && (
            <motion.div key={popMsg + Date.now()}
              initial={{ opacity: 0, scale: 0.4, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 1.3 }}
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-black text-white pointer-events-none whitespace-nowrap"
              style={{ fontFamily: '"Exo 2"', textShadow: '0 0 30px #ffcc00, 0 0 60px #ff88cc', zIndex: 10 }}>
              {popMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wave clear banner */}
        <AnimatePresence>
          {waveBanner && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="absolute top-5 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full text-sm font-black text-black whitespace-nowrap"
              style={{ background: 'linear-gradient(90deg, #ffcc00, #ff88cc)' }}>
              {waveBanner}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game over */}
        <AnimatePresence>
          {phase === 'gameover' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: 'rgba(5,2,20,0.88)' }}>
              <div className="text-6xl mb-4">😢</div>
              <h2 className="text-4xl font-black text-white mb-2" style={{ fontFamily: '"Exo 2"', textShadow: '0 0 24px #ff88cc' }}>
                Oh no!
              </h2>
              <p className="text-pink-300 font-mono text-sm mb-1">The Token Munchers ate your tokens!</p>
              <p className="text-3xl font-black mb-6" style={{ color: '#ffd700', textShadow: '0 0 12px #ffaa00' }}>
                ₮ {hud.score} tokens saved!
              </p>
              <div className="flex gap-3">
                <button onClick={restartGame}
                  className="px-8 py-3 rounded-xl font-black text-black text-sm transition-transform hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(90deg, #ffcc00, #ff88cc)', fontFamily: '"Exo 2"' }}>
                  ⭐ Try Again!
                </button>
                <button onClick={onExit}
                  className="px-6 py-3 rounded-xl font-bold text-white border border-slate-700 hover:border-slate-500 text-sm transition-colors">
                  Main Menu
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile buttons */}
      <div className="flex gap-6 mt-3 sm:hidden">
        {[['◀', 'ArrowLeft'], ['▶', 'ArrowRight']].map(([label, key]) => (
          <button key={label}
            onPointerDown={() => handleVBtn(key, true)}
            onPointerUp={() => handleVBtn(key, false)}
            onPointerLeave={() => handleVBtn(key, false)}
            className="w-20 h-14 rounded-2xl text-3xl font-bold text-white active:scale-90 transition-transform"
            style={{ background: 'linear-gradient(135deg, #220a33, #330a22)', border: '2px solid #ff88cc44' }}>
            {label}
          </button>
        ))}
      </div>

      <div className="hidden sm:flex gap-5 mt-2 text-xs text-slate-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        <span>← → Aim your beam</span>
        <span>Auto-fires rainbow laser</span>
        <span>Walk over ₮ coins to collect</span>
        <button onClick={onExit} className="hover:text-slate-400 transition-colors ml-4">ESC Menu</button>
      </div>
    </div>
  )
}
