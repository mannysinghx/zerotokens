import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Canvas dimensions & perspective constants ────────────────────────────────
const W = 800
const H = 560
const HZ = 185       // horizon Y
const VPX = W / 2    // vanishing point X

// Convert world → screen. wx: -1..1 (center=0), wz: 0 (far) → 1 (near/bottom)
function toScreen(wx, wz) {
  const t = Math.max(0.001, Math.min(1, wz))
  const y = HZ + Math.pow(t, 0.62) * (H - HZ)
  const x = VPX + wx * W * 0.46 * (0.08 + t * 0.92)
  return { x, y }
}
function dScale(wz) { return 0.13 + Math.max(0, Math.min(1, wz)) * 0.87 }

// ─── Entity factories ─────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2) }

function makePlayer(mode) {
  return {
    wx: 0, wz: 0.91,
    hp: mode === 'kids' ? 5 : 3,
    maxHp: mode === 'kids' ? 5 : 3,
    swinging: false, swingTimer: 0, swingDur: mode === 'kids' ? 0.55 : 0.32, swingSide: 1,
    firing: false, fireTimer: 0,
    energy: 40, maxEnergy: 100,
    dodging: false, dodgeTimer: 0, dodgeDur: 0.24, dodgeDir: 0,
    invTimer: 0,
    score: 0, combo: 0, comboTimer: 0,
  }
}

const ENEMY_DEFS = {
  grunt:    { hp: 1,  speed: 0.11, color: '#ff4455', eye: '#ff0000', reward: 10, size: 1.0,  label: 'TOKEN\nDRAINER' },
  shielder: { hp: 2,  speed: 0.08, color: '#9933ff', eye: '#cc00ff', reward: 20, size: 1.15, label: 'CONTEXT\nBLOATER' },
  gunner:   { hp: 1,  speed: 0.05, color: '#ff8800', eye: '#ffbb00', reward: 15, size: 0.95, stayWz: 0.42, label: 'HALLUCINATOR' },
  boss:     { hp: 12, speed: 0.055, color: '#ff0066', eye: '#ff3333', reward: 200, size: 2.4, label: 'MAX_TOKENS' },
}

function makeEnemy(type, wave) {
  const def = ENEMY_DEFS[type] || ENEMY_DEFS.grunt
  return {
    id: uid(), type,
    wx: (Math.random() - 0.5) * 1.7,
    wz: 0.02,
    hp: def.hp + Math.floor(wave / 3), maxHp: def.hp + Math.floor(wave / 3),
    speed: def.speed * (1 + wave * 0.06),
    color: def.color, eye: def.eye, size: def.size,
    stayWz: def.stayWz || null,
    reward: def.reward,
    attackTimer: 1.5 + Math.random() * 2,
    hitFlash: 0, dying: false, dieTimer: 0,
  }
}

function makeProj(x, y, vx, vy, owner, color, dmg) {
  return { id: uid(), x, y, vx, vy, owner, color, dmg, dead: false }
}

function makePart(x, y, vx, vy, color, size, life) {
  return { id: uid(), x, y, vx, vy, color, size, life, maxLife: life, orb: false }
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LaserSwordGame({ mode, onExit }) {
  const cvs = useRef(null)
  const gs   = useRef(null)    // mutable game state
  const keys = useRef({})
  const raf  = useRef(null)
  const last = useRef(null)

  // React state just for the HUD and overlays
  const [phase, setPhase]   = useState('playing')
  const [hud, setHud]       = useState({ score: 0, hp: mode === 'kids' ? 5 : 3, wave: 1, energy: 40 })
  const [waveBanner, setWaveBanner] = useState('')

  // ── Stars (background) ──────────────────────────────────────────────────────
  const stars = useRef(Array.from({ length: 90 }, () => ({
    x: Math.random() * W,
    y: Math.random() * HZ,
    r: Math.random() * 1.8 + 0.3,
    b: Math.random(),
  })))

  // ── Wave builder ────────────────────────────────────────────────────────────
  function buildWave(wave) {
    const q = []
    if (mode === 'kids') {
      const n = 3 + wave * 2
      for (let i = 0; i < n; i++) q.push({ type: 'grunt', delay: i * 1.8 })
    } else {
      const n = 4 + wave * 2
      for (let i = 0; i < n; i++) {
        let t = 'grunt'
        if (wave >= 2 && i % 3 === 0) t = 'gunner'
        if (wave >= 3 && i % 4 === 0) t = 'shielder'
        q.push({ type: t, delay: i * 1.3 })
      }
      if (wave % 5 === 0) q.push({ type: 'boss', delay: n * 1.3 + 2 })
    }
    return q
  }

  // ── Init ────────────────────────────────────────────────────────────────────
  function initGame() {
    const wave = 1
    gs.current = {
      player: makePlayer(mode),
      enemies: [], projectiles: [], particles: [],
      wave,
      spawnQ: buildWave(wave),
      spawnTimer: 0,
      wavePhase: 'intro',   // 'intro' | 'fighting' | 'clear'
      waveTimer: 2.5,
    }
    last.current = null
    raf.current = requestAnimationFrame(loop)
  }

  // ── Main loop ────────────────────────────────────────────────────────────────
  function loop(ts) {
    if (!last.current) last.current = ts
    const dt = Math.min((ts - last.current) / 1000, 0.05)
    last.current = ts
    if (gs.current) {
      update(dt)
      draw()
    }
    raf.current = requestAnimationFrame(loop)
  }

  // ── Update ──────────────────────────────────────────────────────────────────
  function update(dt) {
    const g = gs.current
    const p = g.player
    const k = keys.current

    // Wave management
    if (g.wavePhase === 'intro') {
      g.waveTimer -= dt
      if (g.waveTimer <= 0) g.wavePhase = 'fighting'
    }

    if (g.wavePhase === 'fighting') {
      g.spawnTimer -= dt
      if (g.spawnQ.length > 0) {
        g.spawnQ[0].delay -= dt
        if (g.spawnQ[0].delay <= 0) {
          g.enemies.push(makeEnemy(g.spawnQ.shift().type, g.wave))
          g.spawnTimer = 0.25
        }
      }
      if (g.spawnQ.length === 0 && g.enemies.length === 0) {
        g.wavePhase = 'clear'
        g.waveTimer = 2.5
        const bonus = g.wave * 50
        p.score += bonus
        p.hp = Math.min(p.maxHp, p.hp + 1)
        setWaveBanner(`₮ AI Wave ${g.wave} defeated! +${bonus} tokens saved · Shield restored`)
        setHud(h => ({ ...h, score: p.score, hp: p.hp }))
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

    // ── Player movement ────────────────────────────────────────────────────────
    const spd = p.dodging ? 0 : 1.3
    if (!p.dodging) {
      if (k['ArrowLeft'] || k['a'] || k['A']) p.wx = Math.max(-0.92, p.wx - spd * dt)
      if (k['ArrowRight'] || k['d'] || k['D']) p.wx = Math.min(0.92, p.wx + spd * dt)
    } else {
      p.wx = Math.max(-0.92, Math.min(0.92, p.wx + p.dodgeDir * 2.8 * dt))
    }

    // Sword
    if ((k[' '] || k['z'] || k['Z']) && !p.swinging) {
      p.swinging = true
      p.swingTimer = p.swingDur
      p.swingSide = (k['ArrowLeft'] || k['a'] || k['A']) ? -1 : 1
      doSwordSwing(g)
    }
    if (p.swinging) { p.swingTimer -= dt; if (p.swingTimer <= 0) p.swinging = false }

    // Laser fire
    const wantFire = k['f'] || k['F'] || k['e'] || k['E']
    if (wantFire && p.energy >= 25) {
      p.firing = true
    } else if (!wantFire) {
      p.firing = false
    }
    if (p.firing) {
      p.fireTimer -= dt
      if (p.fireTimer <= 0) {
        p.fireTimer = 0.09
        p.energy -= 7
        if (p.energy <= 0) { p.energy = 0; p.firing = false }
        const { x: px, y: py } = toScreen(p.wx, p.wz)
        g.projectiles.push(makeProj(px, py - 25, 0, -520, 'player', '#00ffff', 1))
      }
    }

    // Dodge
    if ((k['Shift'] || k['c'] || k['C']) && !p.dodging && !p.swinging) {
      p.dodging = true
      p.dodgeTimer = p.dodgeDur
      p.dodgeDir = (k['ArrowLeft'] || k['a'] || k['A']) ? -1 : 1
      p.invTimer = Math.max(p.invTimer, p.dodgeDur + 0.1)
    }
    if (p.dodging) { p.dodgeTimer -= dt; if (p.dodgeTimer <= 0) p.dodging = false }
    if (p.invTimer > 0) p.invTimer -= dt

    // Energy recharge
    p.energy = Math.min(p.maxEnergy, p.energy + 9 * dt)

    // Combo decay
    if (p.comboTimer > 0) { p.comboTimer -= dt; if (p.comboTimer <= 0) p.combo = 0 }

    // ── Enemies ──────────────────────────────────────────────────────────────
    for (let i = g.enemies.length - 1; i >= 0; i--) {
      const e = g.enemies[i]
      if (e.dying) {
        e.dieTimer += dt
        if (e.dieTimer > 0.45) {
          const { x, y } = toScreen(e.wx, e.wz)
          spawnExplosion(g, x, y, e.color)
          g.enemies.splice(i, 1)
        }
        continue
      }
      if (e.hitFlash > 0) e.hitFlash -= dt

      // Move forward
      const target = e.stayWz || 0.88
      if (e.wz < target) e.wz += e.speed * dt

      // Drift horizontally toward player
      e.wx += (p.wx - e.wx) * 0.12 * dt

      // Melee damage if reached player
      if (e.wz >= 0.86 && Math.abs(e.wx - p.wx) < 0.22 && p.invTimer <= 0) {
        damagePlayer(g, p, 1)
        e.wz -= 0.25
      }

      // Shoot at player
      e.attackTimer -= dt
      if (e.attackTimer <= 0) {
        e.attackTimer = (mode === 'kids' ? 3 : 1.8) + Math.random() * 1.5
        const { x: ex, y: ey } = toScreen(e.wx, e.wz)
        const { x: px, y: py } = toScreen(p.wx, p.wz)
        const shots = e.type === 'boss' ? 3 : 1
        for (let s = 0; s < shots; s++) {
          const tx = px + (s - 1) * 35, ty = py
          const dx = tx - ex, dy = ty - ey
          const len = Math.hypot(dx, dy) || 1
          const spd = mode === 'kids' ? 215 : 320
          g.projectiles.push(makeProj(ex, ey, dx / len * spd, dy / len * spd, 'enemy', e.color, e.type === 'boss' ? 2 : 1))
        }
      }
    }

    // ── Projectiles ───────────────────────────────────────────────────────────
    for (let i = g.projectiles.length - 1; i >= 0; i--) {
      const proj = g.projectiles[i]
      proj.x += proj.vx * dt
      proj.y += proj.vy * dt

      if (proj.x < -60 || proj.x > W + 60 || proj.y < -60 || proj.y > H + 60) {
        g.projectiles.splice(i, 1)
        continue
      }

      if (proj.owner === 'enemy') {
        const { x: px, y: py } = toScreen(p.wx, p.wz)

        // Kids auto-block: sword is always on if close
        const autoBlock = mode === 'kids' && Math.hypot(proj.x - px, proj.y - py) < 50
        const manualBlock = p.swinging && Math.hypot(proj.x - px, proj.y - py) < 80

        if (autoBlock || manualBlock) {
          // Deflect back
          proj.vy = -Math.abs(proj.vy) * 1.1
          proj.vx *= -0.5
          proj.owner = 'player'
          proj.color = '#00ffff'
          spawnSparks(g, proj.x, proj.y, '#00ffff', 6)
          p.energy = Math.min(p.maxEnergy, p.energy + 18)
          continue
        }

        if (Math.hypot(proj.x - px, proj.y - py) < 18 && p.invTimer <= 0) {
          damagePlayer(g, p, proj.dmg)
          spawnSparks(g, px, py, '#ff4444', 8)
          g.projectiles.splice(i, 1)
          continue
        }
      }

      if (proj.owner === 'player') {
        let hit = false
        for (let j = g.enemies.length - 1; j >= 0; j--) {
          const e = g.enemies[j]
          if (e.dying) continue
          const { x: ex, y: ey } = toScreen(e.wx, e.wz)
          const hitR = 26 * dScale(e.wz) * e.size
          if (Math.hypot(proj.x - ex, proj.y - ey) < hitR) {
            e.hp -= proj.dmg
            e.hitFlash = 0.14
            spawnSparks(g, proj.x, proj.y, '#ffaa00', 5)
            if (e.hp <= 0) killEnemy(g, p, e)
            g.projectiles.splice(i, 1)
            hit = true; break
          }
        }
        if (hit) continue
      }
    }

    // ── Particles ─────────────────────────────────────────────────────────────
    for (let i = g.particles.length - 1; i >= 0; i--) {
      const pt = g.particles[i]
      pt.x += pt.vx * dt
      pt.y += pt.vy * dt
      pt.vy += 110 * dt
      pt.life -= dt / pt.maxLife
      if (pt.life <= 0) g.particles.splice(i, 1)
    }

    // Twinkle stars
    stars.current.forEach(s => { s.b = Math.max(0.1, Math.min(1, s.b + (Math.random() - 0.5) * 0.08)) })

    // Sync HUD (throttle to avoid too many re-renders)
    setHud({ score: p.score, hp: p.hp, wave: g.wave, energy: p.energy })
  }

  function damagePlayer(g, p, dmg) {
    if (p.invTimer > 0) return
    p.hp -= dmg
    p.invTimer = 1.1
    setHud(h => ({ ...h, hp: p.hp }))
    if (p.hp <= 0) {
      cancelAnimationFrame(raf.current)
      setPhase('gameover')
    }
  }

  function killEnemy(g, p, e) {
    e.dying = true
    p.combo++
    p.comboTimer = 2.5
    p.score += e.reward * (1 + Math.floor(p.combo / 3) * 0.5)
    p.energy = Math.min(p.maxEnergy, p.energy + 20)
  }

  function doSwordSwing(g) {
    const p = g.player
    const { x: px, y: py } = toScreen(p.wx, p.wz)
    g.enemies.forEach(e => {
      if (e.dying) return
      const { x: ex, y: ey } = toScreen(e.wx, e.wz)
      if (Math.hypot(ex - px, ey - py) < 95 * dScale(e.wz)) {
        e.hp -= 1
        e.hitFlash = 0.18
        spawnSparks(g, ex, ey, '#ffff44', 8)
        if (e.hp <= 0) killEnemy(g, p, e)
      }
    })
    spawnSparks(g, px, py - 35, '#ffffff', 10)
  }

  function spawnExplosion(g, x, y, color) {
    for (let i = 0; i < 22; i++) {
      const a = Math.random() * Math.PI * 2
      const s = 70 + Math.random() * 180
      g.particles.push(makePart(x, y, Math.cos(a) * s, Math.sin(a) * s - 40, color, 3 + Math.random() * 4, 0.5 + Math.random() * 0.4))
    }
    // Drop token coins (gold) that restore prompt power
    const coinCount = 1 + Math.floor(Math.random() * 2)
    for (let c = 0; c < coinCount; c++) {
      const orb = makePart(x, y, (Math.random() - 0.5) * 80, -80 - Math.random() * 40, '#ffd700', 8, 1.8)
      orb.orb = true
      g.particles.push(orb)
    }
  }

  function spawnSparks(g, x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const s = 35 + Math.random() * 110
      g.particles.push(makePart(x, y, Math.cos(a) * s, Math.sin(a) * s - 25, color, 2 + Math.random() * 3, 0.25 + Math.random() * 0.25))
    }
  }

  // ── Draw ─────────────────────────────────────────────────────────────────────
  function draw() {
    const canvas = cvs.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const g = gs.current
    const p = g.player

    // Background
    ctx.fillStyle = '#000008'
    ctx.fillRect(0, 0, W, H)

    // Stars
    stars.current.forEach(s => {
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${s.b * 0.85})`
      ctx.fill()
    })

    // Horizon glow
    const hg = ctx.createLinearGradient(0, HZ - 30, 0, HZ + 70)
    hg.addColorStop(0, 'transparent')
    hg.addColorStop(0.5, mode === 'kids' ? '#ff880011' : '#00ffff12')
    hg.addColorStop(1, 'transparent')
    ctx.fillStyle = hg; ctx.fillRect(0, HZ - 30, W, 100)

    // Floor grid
    drawFloor(ctx)

    // Entities — sorted far → near so close ones draw on top
    const all = [
      ...g.enemies.map(e => ({ kind: 'enemy', e })),
      { kind: 'player', e: p },
    ].sort((a, b) => a.e.wz - b.e.wz)
    all.forEach(({ kind, e }) => kind === 'enemy' ? drawEnemy(ctx, e, p) : drawPlayer(ctx, p))

    // Projectiles
    g.projectiles.forEach(pr => drawProj(ctx, pr))

    // Particles
    g.particles.forEach(pt => drawPart(ctx, pt))

    // Wave intro banner
    if (g.wavePhase === 'intro' && g.waveTimer > 0) {
      const alpha = Math.min(1, g.waveTimer)
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.font = 'bold 40px "Exo 2", sans-serif'
      ctx.textAlign = 'center'
      ctx.shadowColor = mode === 'kids' ? '#ffcc00' : '#00ffff'
      ctx.shadowBlur = 25
      ctx.fillStyle = '#ffffff'
      ctx.fillText(`⚡  AI WAVE ${g.wave}  ⚡`, W / 2, H / 2 - 18)
      ctx.font = `bold 18px "Exo 2", sans-serif`
      ctx.shadowBlur = 12
      ctx.fillStyle = mode === 'kids' ? '#ffcc00' : '#00ffff'
      const waveHint = g.wave % 5 === 0 ? '⚠ MAX_TOKENS INCOMING' : mode === 'kids' ? 'Token Munchers are coming!' : 'Defend your prompt budget'
      ctx.fillText(waveHint, W / 2, H / 2 + 14)
      ctx.restore()
    }
  }

  function drawFloor(ctx) {
    const col = mode === 'kids' ? '#ffaa00' : '#00ffff'
    const N = 13, M = 11
    ctx.save()
    ctx.lineWidth = 1

    for (let i = 0; i <= N; i++) {
      const bx = (i / N) * W
      ctx.beginPath(); ctx.moveTo(VPX, HZ); ctx.lineTo(bx, H)
      ctx.strokeStyle = (i === 0 || i === N) ? col + '55' : col + '18'
      ctx.lineWidth = (i === 0 || i === N) ? 1.5 : 1
      ctx.stroke()
    }
    for (let j = 1; j <= M; j++) {
      const t = Math.pow(j / M, 1.25)
      const y = HZ + t * (H - HZ)
      const lx = VPX * (1 - t), rx = VPX + t * (W - VPX)
      ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(rx, y)
      ctx.strokeStyle = j === M ? col + '44' : col + '16'
      ctx.lineWidth = j === M ? 1.5 : 1
      ctx.stroke()
    }
    ctx.restore()
  }

  function drawEnemy(ctx, e, player) {
    const { x, y } = toScreen(e.wx, e.wz)
    const sc = dScale(e.wz) * e.size
    const s = sc * 22

    ctx.save()
    if (e.dying) ctx.globalAlpha = Math.max(0, 1 - e.dieTimer / 0.45)
    else if (e.hitFlash > 0) ctx.globalAlpha = 0.45 + Math.abs(Math.sin(e.hitFlash * 35)) * 0.55

    // Shadow on floor
    ctx.beginPath(); ctx.ellipse(x, y, s * 1.1, s * 0.22, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill()

    // Body
    ctx.shadowColor = e.color; ctx.shadowBlur = 10
    ctx.fillStyle = e.color
    // Legs
    ctx.fillRect(x - s * 0.38, y - s * 0.48, s * 0.28, s * 0.48)
    ctx.fillRect(x + s * 0.1, y - s * 0.48, s * 0.28, s * 0.48)
    // Torso
    ctx.fillRect(x - s * 0.48, y - s * 1.42, s * 0.96, s * 0.98)
    // Head
    ctx.fillRect(x - s * 0.4, y - s * 2.15, s * 0.8, s * 0.77)
    // Eyes
    ctx.shadowColor = e.eye; ctx.shadowBlur = 16; ctx.fillStyle = e.eye
    ctx.fillRect(x - s * 0.28, y - s * 1.98, s * 0.22, s * 0.22)
    ctx.fillRect(x + s * 0.06, y - s * 1.98, s * 0.22, s * 0.22)

    // Gun for gunner
    if (e.type === 'gunner') {
      ctx.shadowBlur = 5; ctx.fillStyle = '#aaaaaa'
      ctx.fillRect(x - s * 0.78, y - s * 1.2, s * 0.38, s * 0.14)
    }
    // Boss shoulder pads
    if (e.type === 'boss') {
      ctx.fillStyle = e.color
      ctx.fillRect(x - s * 0.65, y - s * 1.42, s * 0.22, s * 0.4)
      ctx.fillRect(x + s * 0.43, y - s * 1.42, s * 0.22, s * 0.4)
    }

    // HP bar (if >1 max hp)
    if (e.maxHp > 1) {
      const bw = s * 2.2, bh = 5, by = y - s * 2.35
      ctx.shadowBlur = 0
      ctx.fillStyle = '#222'; ctx.fillRect(x - bw / 2, by, bw, bh)
      const pct = e.hp / e.maxHp
      ctx.fillStyle = pct > 0.5 ? '#44ff44' : pct > 0.25 ? '#ffaa00' : '#ff4444'
      ctx.fillRect(x - bw / 2, by, bw * pct, bh)
    }

    // Token symbol on torso + enemy name tag
    if (s > 8) {
      const def = ENEMY_DEFS[e.type] || ENEMY_DEFS.grunt
      ctx.shadowBlur = 0
      // ₮ badge on chest
      ctx.font = `bold ${Math.max(6, s * 0.55)}px "JetBrains Mono", monospace`
      ctx.textAlign = 'center'
      ctx.fillStyle = e.type === 'boss' ? '#ffffff' : '#000000'
      ctx.globalAlpha = Math.min(1, (ctx.globalAlpha || 1) * 0.9)
      ctx.fillText('₮', x, y - s * 0.92)
      // Name tag above head (only when large enough to read)
      if (s > 14) {
        ctx.font = `bold ${Math.max(7, s * 0.38)}px "JetBrains Mono", monospace`
        ctx.fillStyle = e.color
        ctx.shadowColor = e.color; ctx.shadowBlur = 8
        const lines = def.label.split('\n')
        const topY = y - s * 2.55
        lines.forEach((line, li) => ctx.fillText(line, x, topY - (lines.length - 1 - li) * s * 0.45))
      }
    }

    ctx.restore()
  }

  function drawPlayer(ctx, p) {
    const { x, y } = toScreen(p.wx, p.wz)
    const s = 22
    const bc = mode === 'kids' ? '#55aaff' : '#88ccff'
    const sc = mode === 'kids' ? '#ffee00' : '#00ffff'

    ctx.save()
    if (p.invTimer > 0 && Math.floor(p.invTimer * 9) % 2 === 0) ctx.globalAlpha = 0.28

    // Shadow
    ctx.beginPath(); ctx.ellipse(x, y, s * 1.05, s * 0.2, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill()

    ctx.shadowColor = bc; ctx.shadowBlur = 14

    // Legs
    ctx.fillStyle = '#1a4488'
    ctx.fillRect(x - s * 0.37, y - s * 0.44, s * 0.28, s * 0.44)
    ctx.fillRect(x + s * 0.09, y - s * 0.44, s * 0.28, s * 0.44)
    // Torso
    ctx.fillStyle = bc
    ctx.fillRect(x - s * 0.44, y - s * 1.32, s * 0.88, s * 0.92)
    // Head
    ctx.beginPath(); ctx.arc(x, y - s * 1.66, s * 0.38, 0, Math.PI * 2)
    ctx.fillStyle = '#cce0ff'; ctx.fill()
    // Visor
    ctx.shadowColor = sc; ctx.shadowBlur = 12; ctx.fillStyle = sc
    ctx.fillRect(x - s * 0.26, y - s * 1.74, s * 0.52, s * 0.14)

    // Sword
    ctx.save()
    ctx.translate(x + s * 0.48 * p.swingSide, y - s * 0.82)
    if (p.swinging) {
      const prog = 1 - p.swingTimer / p.swingDur
      const ang = p.swingSide * (prog - 0.5) * Math.PI * 1.15
      ctx.rotate(ang)
      // Arc glow
      ctx.save()
      ctx.globalAlpha = 0.28 * (1 - prog)
      ctx.strokeStyle = sc; ctx.lineWidth = 22; ctx.shadowColor = sc; ctx.shadowBlur = 25
      ctx.beginPath()
      ctx.arc(0, 0, s * 2.6, -Math.PI / 2 - p.swingSide * 0.9, -Math.PI / 2 + p.swingSide * 0.9)
      ctx.stroke()
      ctx.restore()
    }
    // Blade
    ctx.strokeStyle = sc; ctx.lineWidth = 4; ctx.shadowColor = sc; ctx.shadowBlur = 18
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -s * 2.3); ctx.stroke()
    // Tip
    ctx.beginPath(); ctx.arc(0, -s * 2.3, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 24; ctx.fill()
    ctx.restore()

    // Laser beam
    if (p.firing) {
      ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 4; ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 22
      ctx.globalAlpha = 0.92
      ctx.beginPath(); ctx.moveTo(x, y - s * 1.0); ctx.lineTo(x, 0); ctx.stroke()
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.globalAlpha = 0.45
      ctx.beginPath(); ctx.moveTo(x, y - s * 1.0); ctx.lineTo(x, 0); ctx.stroke()
    }

    ctx.restore()
  }

  function drawProj(ctx, pr) {
    ctx.save()
    ctx.shadowColor = pr.color; ctx.shadowBlur = 14
    const len = Math.hypot(pr.vx, pr.vy) || 1
    const nx = pr.vx / len, ny = pr.vy / len
    const trail = pr.owner === 'enemy' ? 18 : 28
    ctx.strokeStyle = pr.color; ctx.lineWidth = pr.owner === 'enemy' ? 3 : 4
    ctx.beginPath(); ctx.moveTo(pr.x - nx * trail, pr.y - ny * trail); ctx.lineTo(pr.x, pr.y); ctx.stroke()
    ctx.beginPath(); ctx.arc(pr.x, pr.y, pr.owner === 'enemy' ? 4 : 5, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 18; ctx.fill()
    ctx.restore()
  }

  function drawPart(ctx, pt) {
    ctx.save(); ctx.globalAlpha = Math.max(0, pt.life)
    ctx.shadowColor = pt.color; ctx.shadowBlur = pt.orb ? 18 : 7
    if (pt.orb) {
      ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2)
      ctx.fillStyle = pt.color; ctx.fill()
      // ₮ label on token coins
      ctx.shadowBlur = 0; ctx.fillStyle = '#000'
      ctx.font = `bold ${pt.size * 1.1}px "JetBrains Mono", monospace`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('₮', pt.x, pt.y)
      ctx.textBaseline = 'alphabetic'
    } else {
      ctx.fillStyle = pt.color
      ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size)
    }
    ctx.restore()
  }

  // ── Input ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = e => { keys.current[e.key] = e.type === 'keydown'; if (e.key === ' ') e.preventDefault() }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKey)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey) }
  }, [])

  // Touch virtual buttons
  const handleVBtn = useCallback((key, down) => {
    keys.current[key] = down
  }, [])

  // Mount
  useEffect(() => {
    initGame()
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [])

  const restartGame = () => {
    if (raf.current) cancelAnimationFrame(raf.current)
    setPhase('playing')
    setWaveBanner('')
    initGame()
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  const accent = mode === 'kids' ? '#ffcc00' : '#00ffff'
  const accentDim = mode === 'kids' ? '#ffcc0044' : '#00ffff44'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black select-none"
      style={{ background: 'radial-gradient(ellipse at center, #04040f 0%, #000000 100%)' }}>

      {/* HUD */}
      <div className="w-full max-w-3xl flex items-center justify-between px-3 py-2 text-sm" style={{ fontFamily: '"Exo 2", sans-serif' }}>
        {/* HP */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: hud.hp }).map((_, i) => (
            <span key={i} className="text-lg" style={{ filter: `drop-shadow(0 0 6px ${mode === 'kids' ? '#ff4444' : '#ff3333'})` }}>
              {mode === 'kids' ? '❤️' : '♥'}
            </span>
          ))}
          {Array.from({ length: Math.max(0, (mode === 'kids' ? 5 : 3) - hud.hp) }).map((_, i) => (
            <span key={i} className="text-lg text-slate-700">{mode === 'kids' ? '🖤' : '♡'}</span>
          ))}
        </div>

        {/* Wave */}
        <div className="font-bold text-white text-base" style={{ textShadow: `0 0 10px ${accent}` }}>
          AI WAVE {hud.wave}
        </div>

        {/* Score */}
        <div className="font-bold" style={{ color: accent, textShadow: `0 0 8px ${accent}` }}>
          ₮ {hud.score.toLocaleString()} saved
        </div>
      </div>

      {/* Energy bar */}
      <div className="w-full max-w-3xl px-3 mb-1">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span style={{ color: accent }}>⚡</span>
          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${hud.energy}%`, background: `linear-gradient(90deg, ${accent}, #ffffff88)`, boxShadow: `0 0 8px ${accentDim}` }} />
          </div>
          <span>PROMPT PWR</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative" style={{ border: `1px solid ${accentDim}`, boxShadow: `0 0 40px ${accentDim}` }}>
        <canvas ref={cvs} width={W} height={H} className="block" />

        {/* Wave clear banner */}
        <AnimatePresence>
          {waveBanner && (
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="absolute top-6 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full text-sm font-bold text-black whitespace-nowrap"
              style={{ background: mode === 'kids' ? '#ffcc00' : '#00ffff' }}
            >
              {waveBanner}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over overlay */}
        <AnimatePresence>
          {phase === 'gameover' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.82)' }}>
              <div className="text-5xl mb-3">{mode === 'kids' ? '😢' : '💀'}</div>
              <h2 className="text-3xl font-black text-white mb-1" style={{ fontFamily: '"Exo 2", sans-serif', textShadow: '0 0 20px #ff4444' }}>
                {mode === 'kids' ? 'Token Bots Win!' : 'TOKEN OVERFLOW'}
              </h2>
              <p className="text-slate-400 mb-1">
                {mode === 'kids' ? 'The token munchers got through!' : 'The AI drained your prompt budget.'}
              </p>
              <p className="text-slate-400 mb-2">Survived AI Wave: <strong className="text-white">{hud.wave}</strong></p>
              <p className="text-2xl font-bold mb-6" style={{ color: accent }}>₮ {hud.score.toLocaleString()} tokens saved</p>
              <div className="flex gap-3">
                <button onClick={restartGame}
                  className="px-6 py-2.5 rounded-xl font-bold text-black transition-transform hover:scale-105 active:scale-95"
                  style={{ background: accent }}>
                  {mode === 'kids' ? '⭐ Protect Tokens!' : '⚡ Reclaim Budget'}
                </button>
                <button onClick={onExit}
                  className="px-6 py-2.5 rounded-xl font-bold text-white border border-slate-600 hover:border-slate-400 transition-colors">
                  Main Menu
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile virtual buttons */}
      <div className="flex gap-3 mt-3 sm:hidden">
        {[
          { label: '◀', key: 'ArrowLeft' },
          { label: '⚔', key: ' ' },
          { label: '▶', key: 'ArrowRight' },
          { label: '⚡', key: 'f' },
          { label: '💨', key: 'Shift' },
        ].map(({ label, key }) => (
          <button key={label}
            onPointerDown={() => handleVBtn(key, true)}
            onPointerUp={() => handleVBtn(key, false)}
            onPointerLeave={() => handleVBtn(key, false)}
            className="w-12 h-12 rounded-xl text-lg font-bold text-white border active:scale-90 transition-transform"
            style={{ borderColor: accentDim, background: '#0a0a1f' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Controls hint */}
      <div className="hidden sm:flex gap-5 mt-2 text-xs text-slate-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        <span>← → Move</span>
        <span>Space Prompt Sword</span>
        <span>F Token Beam</span>
        <span>Shift Dodge</span>
        <span className="text-slate-700">·</span>
        <span className="text-yellow-700">Kill bots → save ₮ tokens</span>
        <button onClick={onExit} className="text-slate-600 hover:text-slate-400 transition-colors ml-4">ESC Menu</button>
      </div>
    </div>
  )
}
