/**
 * SkillRadar.jsx
 * Pure SVG radar/spider chart for 5-axis skill visualization.
 * No external chart library — keeps bundle small.
 * Expects: data = [{ axis: string, value: number (0-100) }, ...]
 */
import { motion } from 'framer-motion'

const AXIS_COLORS = ['#00d4ff', '#a855f7', '#10b981', '#f59e0b', '#ef4444']
const RINGS       = [20, 40, 60, 80, 100]

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export default function SkillRadar({ data = [], size = 220, color = '#00d4ff' }) {
  if (!data || data.length === 0) return null

  const cx        = size / 2
  const cy        = size / 2
  const maxR      = size * 0.4
  const n         = data.length
  const angleStep = 360 / n

  // Axis tip positions
  const axes = data.map((d, i) => ({
    ...d,
    angle: angleStep * i,
    tip: polarToCartesian(cx, cy, maxR, angleStep * i),
  }))

  // Background ring polygons
  const ringPaths = RINGS.map(pct => {
    const r = (pct / 100) * maxR
    const pts = axes.map(a => {
      const p = polarToCartesian(cx, cy, r, a.angle)
      return `${p.x},${p.y}`
    })
    return pts.join(' ')
  })

  // Data polygon
  const dataPts = axes.map(a => {
    const r = ((a.value ?? 0) / 100) * maxR
    const p = polarToCartesian(cx, cy, r, a.angle)
    return `${p.x},${p.y}`
  })

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="select-none"
      aria-label="Skill radar chart"
    >
      {/* Ring lines */}
      {ringPaths.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="rgba(100,116,139,0.2)"
          strokeWidth="1"
        />
      ))}

      {/* Axis spokes */}
      {axes.map((a, i) => (
        <line
          key={i}
          x1={cx} y1={cy}
          x2={a.tip.x} y2={a.tip.y}
          stroke="rgba(100,116,139,0.25)"
          strokeWidth="1"
        />
      ))}

      {/* Data fill */}
      <motion.polygon
        points={dataPts.join(' ')}
        fill={color + '22'}
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />

      {/* Data dots */}
      {axes.map((a, i) => {
        const r = ((a.value ?? 0) / 100) * maxR
        const p = polarToCartesian(cx, cy, r, a.angle)
        return (
          <motion.circle
            key={i}
            cx={p.x} cy={p.y} r={4}
            fill={AXIS_COLORS[i % AXIS_COLORS.length]}
            stroke="rgba(15,23,42,0.8)"
            strokeWidth="1.5"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.06 }}
          />
        )
      })}

      {/* Axis labels */}
      {axes.map((a, i) => {
        // Push label slightly beyond the tip
        const labelR = maxR + 18
        const lp     = polarToCartesian(cx, cy, labelR, a.angle)
        const anchor = lp.x < cx - 5 ? 'end' : lp.x > cx + 5 ? 'start' : 'middle'
        return (
          <text
            key={i}
            x={lp.x} y={lp.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize="10"
            fontFamily="monospace"
            fill={AXIS_COLORS[i % AXIS_COLORS.length]}
            opacity="0.85"
          >
            {a.axis}
            <tspan
              x={lp.x}
              dy="13"
              fontSize="9"
              fill="rgba(148,163,184,0.7)"
            >
              {a.value ?? 0}%
            </tspan>
          </text>
        )
      })}
    </svg>
  )
}
