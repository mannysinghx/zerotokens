/**
 * costCalculator.js
 * Converts token savings into real dollar amounts for popular AI models.
 * Prices are per 1,000 input tokens (USD) as of mid-2025.
 */

export const MODELS = [
  { id: 'gpt4o',        name: 'GPT-4o',          pricePerK: 0.005  },
  { id: 'gpt4o_mini',   name: 'GPT-4o mini',      pricePerK: 0.00015 },
  { id: 'claude3_opus', name: 'Claude 3 Opus',    pricePerK: 0.015  },
  { id: 'claude3_5',    name: 'Claude 3.5 Sonnet', pricePerK: 0.003  },
  { id: 'gemini15pro',  name: 'Gemini 1.5 Pro',   pricePerK: 0.00125 },
]

/**
 * Calculate cost savings for a given number of tokens saved.
 * @param {number} tokensSaved
 * @returns {Array<{id,name,savedUSD,savedUSDFormatted}>}
 */
export function calcSavings(tokensSaved) {
  if (!tokensSaved || tokensSaved <= 0) return []
  return MODELS.map(m => {
    const savedUSD = (tokensSaved / 1000) * m.pricePerK
    return {
      ...m,
      savedUSD,
      savedUSDFormatted: savedUSD < 0.0001
        ? `$${(savedUSD * 1_000_000).toFixed(2)}µ`
        : savedUSD < 0.01
          ? `$${(savedUSD * 1000).toFixed(3)}m`
          : `$${savedUSD.toFixed(4)}`,
    }
  })
}

/**
 * Extrapolate lifetime savings based on historical token data.
 * @param {number} totalTokensSaved  – cumulative from player save
 * @returns {{ perDay: number, perMonth: number, perYear: number, formatted: object }}
 */
export function lifetimeSavingsProjection(totalTokensSaved) {
  const savings = calcSavings(totalTokensSaved)
  const gpt4oEntry = savings.find(s => s.id === 'gpt4o')
  const base = gpt4oEntry?.savedUSD ?? 0
  return {
    perDay:   base,
    perMonth: base * 30,
    perYear:  base * 365,
    formatted: {
      perDay:   `$${(base).toFixed(4)}`,
      perMonth: `$${(base * 30).toFixed(3)}`,
      perYear:  `$${(base * 365).toFixed(2)}`,
    },
  }
}
