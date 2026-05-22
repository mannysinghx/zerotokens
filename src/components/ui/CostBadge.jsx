/**
 * CostBadge.jsx
 * Shows real dollar savings across AI models for a given tokensSaved count.
 * Includes a model selector dropdown so players can see savings for their model.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MODELS, calcSavings } from '../../utils/costCalculator.js'

export default function CostBadge({ tokensSaved = 0 }) {
  const [open,         setOpen]         = useState(false)
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id)

  if (!tokensSaved || tokensSaved <= 0) return null

  const savings     = calcSavings(tokensSaved)
  const activeSaving = savings.find(s => s.id === selectedModel) ?? savings[0]

  return (
    <div className="card p-4 mb-4 border-neon-green/20 bg-green-900/5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs uppercase tracking-widest text-neon-green font-mono">
          💰 Real Cost Saved
        </h3>
        {/* Model selector */}
        <div className="relative">
          <button
            onClick={() => setOpen(o => !o)}
            className="text-xs font-mono text-slate-400 hover:text-neon-blue border border-slate-700 hover:border-neon-blue/40 rounded-lg px-2 py-1 transition-colors flex items-center gap-1"
          >
            {MODELS.find(m => m.id === selectedModel)?.name}
            <span className="text-slate-600">{open ? '▲' : '▼'}</span>
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0,  scale: 1     }}
                exit={{    opacity: 0, y: -4, scale: 0.95 }}
                className="absolute right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 min-w-max"
              >
                {MODELS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedModel(m.id); setOpen(false) }}
                    className={`block w-full text-left px-3 py-2 text-xs font-mono transition-colors first:rounded-t-xl last:rounded-b-xl ${
                      m.id === selectedModel
                        ? 'text-neon-green bg-green-900/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {m.name}
                    <span className="text-slate-600 ml-2">${m.pricePerK}/1K</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Primary saving for selected model */}
      <div className="flex items-baseline gap-2 mb-3">
        <motion.span
          key={activeSaving.savedUSDFormatted}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1,   opacity: 1 }}
          className="text-2xl font-black font-mono text-neon-green"
        >
          {activeSaving.savedUSDFormatted}
        </motion.span>
        <span className="text-xs text-slate-500 font-mono">
          saved on {activeSaving.name} · {tokensSaved} tokens
        </span>
      </div>

      {/* Mini grid for all models */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {savings.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedModel(s.id)}
            className={`rounded-lg border px-2 py-1.5 text-left transition-all ${
              s.id === selectedModel
                ? 'border-neon-green/40 bg-neon-green/5'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-xs text-slate-500 font-mono truncate">{s.name}</div>
            <div className={`text-xs font-bold font-mono ${s.id === selectedModel ? 'text-neon-green' : 'text-slate-300'}`}>
              {s.savedUSDFormatted}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
