/**
 * CertBadge.jsx
 * Reusable certification tier chip.
 * Used in: LandingScreen, CertificationScreen, LeaderboardScreen, CertificateViewScreen.
 */
import { motion } from 'framer-motion'

export default function CertBadge({ tier, size = 'md', animate = false }) {
  if (!tier) return null

  const sizes = {
    xs: 'text-xs px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2',
    xl: 'text-lg px-5 py-3 gap-3',
  }[size] ?? 'text-sm px-3 py-1.5 gap-2'

  const Tag = animate ? motion.div : 'div'
  const animProps = animate
    ? { initial: { scale: 0, rotate: -10 }, animate: { scale: 1, rotate: 0 }, transition: { type: 'spring', stiffness: 260 } }
    : {}

  return (
    <Tag
      {...animProps}
      className={`inline-flex items-center rounded-full border font-mono font-bold ${sizes}`}
      style={{
        borderColor: tier.borderColor ?? tier.color + '44',
        background:  tier.bgColor    ?? tier.color + '14',
        color:       tier.color,
      }}
    >
      <span>{tier.emoji}</span>
      <span>{tier.name}</span>
    </Tag>
  )
}
