import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

export function triggerCoinBurst(score = 80) {
  if (score < 40) return
  const count   = Math.floor(score / 10)
  const colors  = score >= 90
    ? ['#f59e0b', '#fbbf24', '#ffffff']
    : ['#00d4ff', '#a855f7', '#f59e0b']

  confetti({
    particleCount: count * 3,
    spread:        80,
    origin:        { y: 0.5 },
    colors,
    shapes:        ['circle', 'square'],
    scalar:        0.9,
    gravity:       1.2,
    drift:         0.5,
  })

  if (score >= 90) {
    setTimeout(() => confetti({
      particleCount: 40,
      angle:   60,
      spread:  55,
      origin:  { x: 0, y: 0.6 },
      colors,
    }), 200)
    setTimeout(() => confetti({
      particleCount: 40,
      angle:   120,
      spread:  55,
      origin:  { x: 1, y: 0.6 },
      colors,
    }), 400)
  }
}

export default function CoinBurst({ trigger, score }) {
  const fired = useRef(false)
  useEffect(() => {
    if (trigger && !fired.current) {
      fired.current = true
      triggerCoinBurst(score)
    }
  }, [trigger, score])
  return null
}
