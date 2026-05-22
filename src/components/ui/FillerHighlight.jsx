/**
 * FillerHighlight.jsx
 * Renders prompt text with filler words highlighted in red/amber.
 * Used by the Surgical Scalpel power in GameScreen.
 */
import { useMemo } from 'react'
import { findFillerWords } from '../../utils/powerEffects.js'

export default function FillerHighlight({ text = '', className = '' }) {
  const segments = useMemo(() => {
    const matches = findFillerWords(text)
    if (matches.length === 0) return [{ text, highlight: false }]

    const parts = []
    let cursor = 0
    matches.forEach(({ start, end, word }) => {
      if (start > cursor) parts.push({ text: text.slice(cursor, start), highlight: false })
      parts.push({ text: word, highlight: true })
      cursor = end
    })
    if (cursor < text.length) parts.push({ text: text.slice(cursor), highlight: false })
    return parts
  }, [text])

  return (
    <p className={`font-mono text-sm leading-relaxed ${className}`}>
      {segments.map((seg, i) =>
        seg.highlight ? (
          <mark
            key={i}
            title="Filler word — safe to remove"
            className="bg-red-900/40 text-neon-red border-b border-neon-red/60 rounded px-0.5 cursor-help"
          >
            {seg.text}
          </mark>
        ) : (
          <span key={i} className="text-slate-300">{seg.text}</span>
        ),
      )}
      {segments.some(s => s.highlight) && (
        <span className="ml-2 text-xs text-neon-red font-mono opacity-70 align-middle">
          ✂ filler detected
        </span>
      )}
    </p>
  )
}
