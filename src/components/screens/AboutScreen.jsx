/**
 * AboutScreen.jsx
 * Public /about page — origin story, Zero Waste Token Architecture,
 * game design, and contact info.
 *
 * Accessible at https://www.zerotokens.ai/about
 * Standalone route — no game store needed.
 */
import { motion } from 'framer-motion'

// ── animation presets ─────────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.6, ease: 'easeOut' } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
}

// ── tiny layout helpers ───────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <span className="inline-block text-xs font-mono uppercase tracking-[0.25em] px-3 py-1 rounded-full border mb-4"
      style={{ color: '#00d4ff', borderColor: '#00d4ff33', background: '#00d4ff0d' }}>
      {children}
    </span>
  )
}

function SectionHeading({ children }) {
  return (
    <h2 className="text-3xl md:text-4xl font-black text-slate-100 mb-4 leading-tight" style={{ fontFamily: 'Exo 2' }}>
      {children}
    </h2>
  )
}

function Divider() {
  return <div className="border-t border-slate-800 my-16" />
}

function ArchitectureCard({ number, title, desc, color }) {
  return (
    <motion.div variants={fadeUp} className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
      <div className="text-4xl font-black mb-3 font-mono" style={{ color, opacity: 0.8 }}>{number}</div>
      <h3 className="text-lg font-bold text-slate-100 mb-2" style={{ fontFamily: 'Exo 2' }}>{title}</h3>
      <p className="text-slate-400 font-mono text-sm leading-relaxed">{desc}</p>
    </motion.div>
  )
}

function VillainPill({ name, icon }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-full border border-red-800/40 bg-red-900/20 text-red-300">
      {icon} {name}
    </span>
  )
}

function PowerPill({ name, icon }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-full border border-cyan-800/40 bg-cyan-900/20 text-cyan-300">
      {icon} {name}
    </span>
  )
}

function StatBlock({ value, label, sub }) {
  return (
    <div className="text-center px-6 py-5 bg-slate-900 border border-slate-800 rounded-2xl">
      <div className="text-4xl font-black text-neon-blue font-mono mb-1" style={{ textShadow: '0 0 20px #00d4ff66' }}>{value}</div>
      <div className="text-sm font-bold text-slate-200">{label}</div>
      {sub && <div className="text-xs text-slate-500 font-mono mt-1">{sub}</div>}
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────

export default function AboutScreen() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative">
      {/* Scanline overlay */}
      <div className="scanlines pointer-events-none" />

      {/* Nav bar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
        <a href="/" className="font-black text-xl" style={{ fontFamily: 'Exo 2', color: '#00d4ff', textShadow: '0 0 16px #00d4ff66' }}>
          TOKEN<span style={{ color: '#a855f7' }}>QUEST</span>
        </a>
        <div className="flex items-center gap-5">
          <span
            className="text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full"
            style={{ fontFamily: 'Exo 2', color: '#a855f7', background: '#a855f714', border: '1px solid #a855f740', textShadow: '0 0 12px #a855f788' }}
          >
            About Us
          </span>
          <a href="/"
            className="text-sm font-mono px-4 py-2 rounded-xl border transition-colors"
            style={{ borderColor: '#00d4ff44', color: '#00d4ff', background: '#00d4ff0d' }}>
            ▶ Play Now
          </a>
        </div>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <motion.div
          initial="hidden" animate="visible" variants={stagger}
          className="text-center mb-20"
        >
          <motion.div variants={fadeUp} className="text-7xl mb-6 select-none">🤖</motion.div>
          <motion.h1 variants={fadeUp}
            className="text-5xl md:text-6xl font-black mb-4 leading-none"
            style={{ fontFamily: 'Exo 2' }}>
            <span style={{ color: '#00d4ff', textShadow: '0 0 32px #00d4ff55' }}>TOKEN</span>
            <span style={{ color: '#a855f7', textShadow: '0 0 32px #a855f755' }}>QUEST</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-xl text-slate-400 font-mono max-w-2xl mx-auto leading-relaxed">
            We built a game to solve a{' '}
            <span style={{ color: '#f59e0b' }}>real, expensive problem</span>
            {' '}— token waste is silently draining AI budgets across every industry.
          </motion.p>
          <motion.div variants={fadeUp} className="flex justify-center gap-4 mt-6 flex-wrap">
            <StatBlock value="11" label="Token Waste Villains" sub="identified anti-patterns" />
            <StatBlock value="13" label="Zero-Waste Superpowers" sub="optimization techniques" />
            <StatBlock value="4"  label="Game Modes"          sub="to master every skill" />
            <StatBlock value="∞"  label="Tokens You Can Save" sub="starting today" />
          </motion.div>
        </motion.div>

        {/* ── Origin Story ───────────────────────────────────────────────────── */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
          <motion.div variants={fadeUp}>
            <SectionLabel>Our Story</SectionLabel>
            <SectionHeading>
              The <span style={{ color: '#00d4ff' }}>problem</span> we couldn't ignore
            </SectionHeading>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-5 text-slate-300 font-mono text-sm leading-relaxed">
            <p>
              While building AI-powered products for enterprise clients, we kept seeing the same pattern:
              intelligent developers writing <em className="text-amber-400 not-italic">shockingly wasteful prompts</em>.
              Simple tasks that should cost fractions of a cent were consuming 10–50× more tokens than
              necessary. A single API call ballooning from 200 tokens to 2,000 for the exact same output.
            </p>
            <p>
              Multiply that by a million calls per day and you're looking at{' '}
              <span className="text-neon-red">tens of thousands of dollars in avoidable cost</span> —
              every month, for a single application.
            </p>
            <p>
              It wasn't that engineers were careless. They simply hadn't been taught to think in tokens.
              No one had. The tooling was new, the patterns were emerging, and the pricing model was invisible
              until the AWS bill arrived.
            </p>
            <p>
              We started writing internal guides. Checklists. Code review notes. But documentation alone
              doesn't change behavior — especially not under deadline pressure. We needed something that made
              the <em className="text-cyan-400 not-italic">right habit</em> feel instinctive.
              That's where the game came from.
            </p>
          </motion.div>
        </motion.section>

        <Divider />

        {/* ── Zero Waste Token Architecture ──────────────────────────────────── */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
          <motion.div variants={fadeUp}>
            <SectionLabel>The Methodology</SectionLabel>
            <SectionHeading>
              Zero Waste Token{' '}
              <span style={{ color: '#a855f7' }}>Architecture</span>
            </SectionHeading>
            <p className="text-slate-400 font-mono text-sm leading-relaxed mb-10">
              Before building the game, we built a framework. The Zero Waste Token Architecture (ZWTA) is
              a systematic approach to measuring, identifying, and eliminating token waste across the full
              lifecycle of an LLM-powered product.
            </p>
          </motion.div>

          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            <ArchitectureCard
              number="01"
              title="Measure First"
              color="#00d4ff"
              desc="Baseline every prompt. Count input and output tokens before optimizing. You can't improve what you haven't measured. We built internal token-counting dashboards long before any game existed."
            />
            <ArchitectureCard
              number="02"
              title="Identify the Villain"
              color="#a855f7"
              desc="Token waste always has a root cause. We catalogued 11 recurring anti-patterns — from redundant context repetition to hallucination-inviting vagueness — and gave each one a name and a face."
            />
            <ArchitectureCard
              number="03"
              title="Apply a Superpower"
              color="#10b981"
              desc="For every villain there is a counter-technique. 13 zero-waste superpowers cover everything from role-framing and constraint anchoring to chain-of-thought pruning and output formatting contracts."
            />
            <ArchitectureCard
              number="04"
              title="Verify the Gain"
              color="#f59e0b"
              desc="After optimization, re-measure. Calculate the percentage reduction. Track it over time. The methodology is a cycle — Measure → Identify → Apply → Verify — and it compounds."
            />
          </motion.div>

          {/* The four waste categories */}
          <motion.div variants={fadeUp} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
            <h3 className="text-base font-bold text-slate-200 mb-4 font-mono uppercase tracking-widest text-center">
              The 4 Root Causes of Token Waste
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-mono">
              {[
                { color: '#ef4444', icon: '🔄', name: 'Redundancy',         desc: 'Repeating context or instructions the model already has.' },
                { color: '#f59e0b', icon: '💬', name: 'Verbosity',          desc: 'Padding, pleasantries, and over-explanations that add zero signal.' },
                { color: '#a855f7', icon: '❓', name: 'Ambiguity',          desc: 'Vague instructions that force the model to hedge or hallucinate.' },
                { color: '#06b6d4', icon: '🎯', name: 'Scope Creep',        desc: 'Asking for too much in one call when a focused query would cost less.' },
              ].map(c => (
                <div key={c.name} className="flex gap-3 items-start">
                  <span className="text-xl">{c.icon}</span>
                  <div>
                    <span className="font-bold" style={{ color: c.color }}>{c.name}</span>
                    <p className="text-slate-500 text-xs mt-0.5">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        <Divider />

        {/* ── Birth of the Game ──────────────────────────────────────────────── */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
          <motion.div variants={fadeUp}>
            <SectionLabel>The Game</SectionLabel>
            <SectionHeading>
              Why a <span style={{ color: '#10b981' }}>game</span>?
            </SectionHeading>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-5 text-slate-300 font-mono text-sm leading-relaxed mb-10">
            <p>
              We ran the framework as written documentation with three different teams. Adoption was polite
              but shallow. People read it once, nodded, and went back to their old habits. The checklists
              sat unused in Confluence.
            </p>
            <p>
              So we asked: <em className="text-cyan-400 not-italic">what if we made the mistake feel bad and the fix feel good?</em>{' '}
              What if every "wasteful prompt" was a villain that punished you — and rewriting it unleashed
              a superpower with a satisfying animation?
            </p>
            <p>
              That's Token Quest. The 11 villains map exactly to the 11 anti-patterns we found in production
              code. The 13 superpowers map to the proven counter-techniques. The game modes cover every
              skill from pattern recognition to constrained budget writing.
            </p>
          </motion.div>

          {/* Villains */}
          <motion.div variants={fadeUp} className="mb-6">
            <h3 className="text-sm font-mono uppercase tracking-widest text-slate-500 mb-3">The 11 Token Waste Villains</h3>
            <div className="flex flex-wrap gap-2">
              {[
                ['The Repeater',      '🔄'], ['The Rambler',    '💬'], ['The Vague Commander', '❓'],
                ['The Over-Prompter', '📜'], ['The Hallucinator Bait', '👻'], ['The Context Dumper', '🗂️'],
                ['The Role Abuser',   '🎭'], ['The Format Freak', '🖨️'], ['The Loop Maker', '🔁'],
                ['The Polite Taxer',  '🙏'], ['The Chain Breaker', '⛓️'],
              ].map(([name, icon]) => <VillainPill key={name} name={name} icon={icon} />)}
            </div>
          </motion.div>

          {/* Superpowers */}
          <motion.div variants={fadeUp}>
            <h3 className="text-sm font-mono uppercase tracking-widest text-slate-500 mb-3">The 13 Zero-Waste Superpowers</h3>
            <div className="flex flex-wrap gap-2">
              {[
                ['Precision Strike',     '⚡'], ['Context Compression', '🗜️'], ['Intent Anchoring',  '🎯'],
                ['Output Contracting',   '📋'], ['Role Framing',        '🦸'], ['Constraint Binding','🔒'],
                ['Chain Pruning',        '✂️'], ['Token Budgeting',     '💰'], ['Format Locking',    '📐'],
                ['Dedup Shield',         '🛡️'], ['Scope Limiting',      '🔭'], ['Signal Boosting',   '📡'],
                ['Hallucination Guard',  '🧲'],
              ].map(([name, icon]) => <PowerPill key={name} name={name} icon={icon} />)}
            </div>
          </motion.div>
        </motion.section>

        <Divider />

        {/* ── For Organizations ──────────────────────────────────────────────── */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
          <motion.div variants={fadeUp}>
            <SectionLabel>For Organizations</SectionLabel>
            <SectionHeading>
              Train your whole team.{' '}
              <span style={{ color: '#00d4ff' }}>Certify every employee.</span>
            </SectionHeading>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-5 text-slate-300 font-mono text-sm leading-relaxed mb-10">
            <p>
              Token Quest ships with a full{' '}
              <span className="text-neon-blue">corporate certification platform</span> built separately
              from the public game. Companies get a private portal where HR admins can manage their entire
              workforce: invite employees, assign field-specific training tracks, monitor progress, and
              download completion certificates.
            </p>
            <p>
              Field training goes deeper than the general game. We built category-specific question banks
              for different functions — finance, marketing, legal, engineering, operations — because a
              financial analyst and a software engineer both write prompts, but they write very different
              ones.
            </p>
          </motion.div>

          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: '🏢', title: 'Private Company Portal',   desc: 'Separate /company-admin route, completely isolated from public accounts. Your data stays in your company.' },
              { icon: '📊', title: 'Progress Tracking',        desc: 'Real-time visibility into who has completed training, grade distributions, tokens-saved averages per team.' },
              { icon: '🎓', title: 'Role-Based Certification', desc: 'Assign employees to specific field tracks. Certifications are earned, not handed out. Track it on their profile.' },
            ].map(c => (
              <motion.div key={c.title} variants={fadeUp}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center hover:border-slate-700 transition-colors">
                <div className="text-3xl mb-3">{c.icon}</div>
                <h3 className="text-sm font-bold text-slate-200 mb-2">{c.title}</h3>
                <p className="text-xs text-slate-500 font-mono leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <Divider />

        {/* ── Contact / CTA ──────────────────────────────────────────────────── */}
        <motion.section
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}
          className="text-center"
        >
          <motion.div variants={fadeUp}>
            <SectionLabel>Get in Touch</SectionLabel>
            <SectionHeading>
              Let's talk{' '}
              <span style={{ color: '#10b981' }}>zero waste</span>
            </SectionHeading>
          </motion.div>

          <motion.p variants={fadeUp}
            className="text-slate-400 font-mono text-sm max-w-xl mx-auto leading-relaxed mb-8">
            Interested in enterprise training? Want to contribute a villain or superpower?
            Found a bug, or just want to say hi? We read every email.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col items-center gap-4">
            <a
              href="mailto:zerotokensai@gmail.com"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-mono text-sm font-bold border transition-all hover:scale-105"
              style={{
                background:   'linear-gradient(90deg, #0f172a, #1e293b)',
                borderColor:  '#00d4ff44',
                color:        '#00d4ff',
                boxShadow:    '0 0 24px #00d4ff22',
              }}
            >
              <span>📧</span>
              <span>zerotokensai@gmail.com</span>
            </a>

            <div className="flex items-center gap-4 mt-2">
              <a href="https://github.com/mannysinghx/zerotokens" target="_blank" rel="noreferrer"
                className="text-xs text-slate-600 hover:text-slate-300 font-mono transition-colors">
                GitHub →
              </a>
              <span className="text-slate-800">·</span>
              <a href="/"
                className="text-xs font-mono px-4 py-2 rounded-xl border transition-colors"
                style={{ borderColor: '#a855f744', color: '#a855f7', background: '#a855f70d' }}>
                ▶ Play Token Quest Free
              </a>
            </div>
          </motion.div>
        </motion.section>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <footer className="mt-20 pt-8 border-t border-slate-800 text-center">
          <p className="text-slate-700 font-mono text-xs">
            © 2025 ZeroTokens.ai · Built with ⚡ to make every token count ·{' '}
            <a href="mailto:zerotokensai@gmail.com" className="hover:text-slate-400 transition-colors">
              zerotokensai@gmail.com
            </a>
          </p>
          <p className="text-slate-700 font-mono text-xs mt-2">
            <a href="/about"
              className="font-black hover:opacity-80 transition-opacity"
              style={{ color: '#a855f7', fontFamily: 'Exo 2' }}>
              About Us
            </a>
            {' · '}
            <a href="/" className="hover:text-slate-500 transition-colors">Play</a>
            {' · '}
            <a href="https://github.com/mannysinghx/zerotokens" target="_blank" rel="noreferrer" className="hover:text-slate-500 transition-colors">GitHub</a>
          </p>
        </footer>

      </div>
    </div>
  )
}
