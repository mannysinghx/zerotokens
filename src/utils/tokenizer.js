export function estimateTokens(text) {
  if (!text?.trim()) return 0
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words * 1.3)
}

export function countWords(text) {
  if (!text?.trim()) return 0
  return text.trim().split(/\s+/).length
}

export function countChars(text) {
  return (text || '').length
}

export function tokenDiff(original, optimized) {
  const a = estimateTokens(original)
  const b = estimateTokens(optimized)
  return { original: a, optimized: b, saved: Math.max(0, a - b), pct: a > 0 ? Math.round(((a - b) / a) * 100) : 0 }
}
