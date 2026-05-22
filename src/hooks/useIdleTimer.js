/**
 * useIdleTimer.js
 * Detects user idle time and triggers a warning + auto-logout.
 *
 * Timeline:
 *   0 ─────────────── 25 min ── (warning) ── 30 min ── (logout)
 *
 * Any user activity (mouse, keyboard, scroll, touch) resets the clock.
 * "Stay Logged In" button also resets via keepAlive().
 */
import { useEffect, useRef, useState, useCallback } from 'react'

const IDLE_TIMEOUT_MS = 30 * 60 * 1000   // 30 minutes → auto-logout
const WARN_AT_MS      = 25 * 60 * 1000   // 25 minutes → show warning (5 min countdown)
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']

/**
 * @param {object}   opts
 * @param {Function} opts.onLogout  — async function called when idle timer fires
 * @param {boolean}  opts.enabled   — set false when not authenticated (pauses timer)
 * @returns {{ showWarning: boolean, secondsLeft: number, keepAlive: Function }}
 */
export function useIdleTimer({ onLogout, enabled = true }) {
  const lastActivity  = useRef(Date.now())
  const onLogoutRef   = useRef(onLogout)
  const [showWarning, setShowWarning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(300)

  // Keep onLogout ref fresh so the interval never has a stale closure
  useEffect(() => { onLogoutRef.current = onLogout }, [onLogout])

  // Exported: reset the idle clock (used by "Stay Logged In" button)
  const keepAlive = useCallback(() => {
    lastActivity.current = Date.now()
    setShowWarning(false)
    setSecondsLeft(300)
  }, [])

  useEffect(() => {
    if (!enabled) {
      setShowWarning(false)
      return
    }

    // Reset clock the moment the timer is enabled (e.g. just logged in)
    lastActivity.current = Date.now()

    // Track activity — passive listeners for performance
    const onActivity = () => { lastActivity.current = Date.now() }
    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, onActivity, { passive: true }))

    // Tick every second — cheap Date.now() comparison
    const tick = setInterval(() => {
      const idle      = Date.now() - lastActivity.current
      const remaining = Math.max(0, IDLE_TIMEOUT_MS - idle)

      if (idle >= IDLE_TIMEOUT_MS) {
        // Time's up — fire logout (guard against double-fire)
        clearInterval(tick)
        onLogoutRef.current?.()
      } else if (idle >= WARN_AT_MS) {
        setSecondsLeft(Math.ceil(remaining / 1000))
        setShowWarning(true)
      } else {
        // Active — hide warning if somehow still visible
        setShowWarning(false)
        setSecondsLeft(300)
      }
    }, 1000)

    return () => {
      ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, onActivity))
      clearInterval(tick)
    }
  }, [enabled])   // re-runs only when enabled changes (login/logout)

  return { showWarning, secondsLeft, keepAlive }
}
