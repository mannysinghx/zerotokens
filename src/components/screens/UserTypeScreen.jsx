import { motion } from 'framer-motion'
import useGameStore from '../../store/gameStore.js'

const cardVariants = {
  hidden:  { opacity: 0, y: 32 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, type: 'spring', stiffness: 160, damping: 18 } }),
}

export default function UserTypeScreen() {
  const { goTo } = useGameStore()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12"
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-3"
      >
        <h1
          className="text-4xl font-black neon-text text-neon-blue"
          style={{ fontFamily: 'Exo 2' }}
        >
          TOKEN<span className="text-neon-purple">QUEST</span>
        </h1>
        <p className="text-slate-500 text-sm font-mono mt-1 tracking-widest uppercase">
          zerotokens.ai
        </p>
      </motion.div>

      {/* Animated robot */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="text-6xl mb-8 select-none"
      >
        🤖
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-slate-400 font-mono text-sm mb-8 text-center"
      >
        How are you playing today?
      </motion.p>

      {/* Two cards */}
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl">
        {/* Company Employee */}
        <motion.button
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(0,212,255,0.2)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => goTo('companyLogin')}
          className="card flex-1 flex flex-col items-center text-center p-8 cursor-pointer group"
          style={{ minHeight: '220px' }}
        >
          <span className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200 block">
            🏢
          </span>
          <h2
            className="text-xl font-black text-neon-blue mb-2"
            style={{ fontFamily: 'Exo 2' }}
          >
            Company Employee
          </h2>
          <p className="text-slate-400 text-sm font-mono leading-relaxed mb-6 flex-1">
            Your company has subscribed to Token Quest. Log in with your work email.
          </p>
          <span className="btn-primary w-full text-sm py-3">
            Log in with work email
          </span>
        </motion.button>

        {/* Individual Learner */}
        <motion.button
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(168,85,247,0.2)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => goTo('individualSignup')}
          className="card flex-1 flex flex-col items-center text-center p-8 cursor-pointer group"
          style={{ minHeight: '220px', borderColor: 'rgba(168,85,247,0.2)' }}
        >
          <span className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200 block">
            🎮
          </span>
          <h2
            className="text-xl font-black text-neon-purple mb-2"
            style={{ fontFamily: 'Exo 2' }}
          >
            Individual Learner
          </h2>
          <p className="text-slate-400 text-sm font-mono leading-relaxed mb-6 flex-1">
            Learn AI prompt optimisation at your own pace. Free forever.
          </p>
          <span className="btn-neon w-full text-sm py-3" style={{ borderColor: 'var(--neon-purple)', color: 'var(--neon-purple)' }}>
            Create free account
          </span>
        </motion.button>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-slate-700 text-xs font-mono mt-8 text-center"
      >
        Master AI prompts · Save tokens · Climb the leaderboard
      </motion.p>
    </motion.div>
  )
}
