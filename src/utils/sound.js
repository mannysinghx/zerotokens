let ctx = null

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

function play(freq, type, duration, gain = 0.18, fadeOut = true) {
  try {
    const ac  = getCtx()
    const osc = ac.createOscillator()
    const g   = ac.createGain()
    osc.connect(g)
    g.connect(ac.destination)
    osc.type      = type
    osc.frequency.setValueAtTime(freq, ac.currentTime)
    g.gain.setValueAtTime(gain, ac.currentTime)
    if (fadeOut) g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration)
    osc.start(ac.currentTime)
    osc.stop(ac.currentTime + duration)
  } catch {}
}

export function playClick() {
  play(800, 'square', 0.05, 0.08)
}

export function playSuccess() {
  // ascending arpeggio
  const ac = getCtx()
  const notes = [523, 659, 784, 1047]
  notes.forEach((f, i) => {
    setTimeout(() => play(f, 'sine', 0.2, 0.15), i * 80)
  })
}

export function playPerfect() {
  const notes = [523, 659, 784, 1047, 1319]
  notes.forEach((f, i) => {
    setTimeout(() => play(f, 'sine', 0.3, 0.2), i * 70)
  })
}

export function playError() {
  play(220, 'sawtooth', 0.2, 0.15)
  setTimeout(() => play(180, 'sawtooth', 0.25, 0.1), 100)
}

export function playBossHit() {
  play(440, 'sawtooth', 0.15, 0.2)
  play(880, 'square',   0.08, 0.1)
}

export function playBossMiss() {
  play(150, 'sawtooth', 0.35, 0.2)
  setTimeout(() => play(100, 'sawtooth', 0.3, 0.15), 120)
}

export function playCoin() {
  const notes = [1047, 1319]
  notes.forEach((f, i) => setTimeout(() => play(f, 'sine', 0.1, 0.12), i * 60))
}

export function playLevelUp() {
  const notes = [523, 659, 784, 1047, 1319, 1568]
  notes.forEach((f, i) => setTimeout(() => play(f, 'sine', 0.3, 0.18), i * 60))
}
