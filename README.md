<div align="center">

```
████████╗ ██████╗ ██╗  ██╗███████╗███╗   ██╗     ██████╗ ██╗   ██╗███████╗███████╗████████╗
╚══██╔══╝██╔═══██╗██║ ██╔╝██╔════╝████╗  ██║    ██╔═══██╗██║   ██║██╔════╝██╔════╝╚══██╔══╝
   ██║   ██║   ██║█████╔╝ █████╗  ██╔██╗ ██║    ██║   ██║██║   ██║█████╗  ███████╗   ██║
   ██║   ██║   ██║██╔═██╗ ██╔══╝  ██║╚██╗██║    ██║▄▄ ██║██║   ██║██╔══╝  ╚════██║   ██║
   ██║   ╚██████╔╝██║  ██╗███████╗██║ ╚████║    ╚██████╔╝╚██████╔╝███████╗███████║   ██║
   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝     ╚══▀▀═╝  ╚═════╝ ╚══════╝╚══════╝   ╚═╝
```

### 🤖 Defeat token waste. Master AI prompts. Earn coins, badges, and XP.

<br/>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-FF0055?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion)
[![Zustand](https://img.shields.io/badge/Zustand-4-brown?style=for-the-badge)](https://zustand-demo.pmnd.rs)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![No API Keys](https://img.shields.io/badge/No_API_Keys-Required-brightgreen?style=for-the-badge)](https://github.com/mannysinghx/zerotokens)
[![100% Client Side](https://img.shields.io/badge/100%25-Client--Side-blue?style=for-the-badge)](https://github.com/mannysinghx/zerotokens)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-ff69b4?style=for-the-badge)](https://github.com/mannysinghx/zerotokens/pulls)

<br/>

> **TokenQuest** is a browser-based gamified learning experience that teaches you to write lean, powerful AI prompts.
> Fight 11 token-waste villains, unlock 13 zero-waste superpowers, and climb the ranks from Beginner to Master.
> Runs entirely in your browser — no account, no API key, no data leaves your device.

<br/>

[▶ Play Now](#-getting-started) · [🎮 Game Modes](#-game-modes) · [👾 Villain Roster](#-villain-roster) · [⚡ Powers](#-zero-waste-powers) · [🗂 Architecture](#-architecture)

</div>

---

## 📸 Screenshots

<div align="center">

| Landing | Game Screen | Results |
|:---:|:---:|:---:|
| ![Landing](docs/landing.png) | ![Game](docs/game.png) | ![Results](docs/results.png) |
| **Welcome back** screen with live stats | **A/B/C choice cards** — pick the best prompt | **S-rank** with confetti + badge unlocks |

| Villain Screen | Arsenal | Level Map |
|:---:|:---:|:---:|
| ![Villains](docs/villains.png) | ![Arsenal](docs/arsenal.png) | ![Map](docs/levelmap.png) |
| 11 villains with HP bars | 13 unlockable zero-waste powers | 25 challenges across 6 levels |

</div>

---

## ✨ Features at a Glance

```
┌─────────────────────────────────────────────────────────────────────┐
│                       TOKENQUEST FEATURES                           │
├──────────────────────────┬──────────────────────────────────────────┤
│  🎮  25 Challenges        │  6 difficulty levels (Beginner → Expert) │
│  🎯  3 Game Modes         │  Fix Prompt / Choose Best / Token Budget  │
│  👾  11 Villains          │  Each maps to specific prompt-waste traps │
│  ⚡  13 Powers            │  Zero-waste architecture patterns         │
│  🏅  12 Badges            │  Achievement system with conditions       │
│  🐉  Boss Battle          │  5-round HP gauntlet                      │
│  🔥  Streak Tracking      │  Daily play streaks with rewards          │
│  💥  Combo Multiplier     │  Chain correct answers for bonus coins    │
│  👤  User Profiles        │  Username + session history               │
│  💾  Persistent Progress  │  Full localStorage persistence            │
│  🕵️  Hidden Archive       │  Every attempt logged for agent training  │
│  🔊  Sound FX             │  Web Audio API synthesized effects        │
│  🌟  Neon CRT Aesthetic   │  Starfield, scanlines, glow effects       │
│  📱  Responsive           │  Mobile-first design                      │
└──────────────────────────┴──────────────────────────────────────────┘
```

---

## 🎮 Game Modes

### ⚔️ Fix Prompt
> *"The villain has corrupted this prompt with filler, vagueness, and repetition. Rewrite it."*

You're shown a bloated, inefficient prompt. Three rewritten versions appear as option cards (A, B, C). Pick the one that:
- Saves the most tokens
- Preserves full intent
- Uses clear action verbs, output formats, and specificity

The **scoring engine** grades your pick across 4 dimensions:

```
Token Savings  ████████████████████████████████  40%
Clarity        ████████████████████████          30%
Intent         ████████████████                  20%
Specificity    ████████                          10%
```

---

### 🎯 Choose Best
> *"Three prompts walk into a bar. Only one gets a useful answer."*

Given a weak base prompt, three alternatives are presented. You must identify the one with:
- A clear action verb
- Specified output format (list, table, JSON…)
- Constrained scope (word count, number of items, target audience)

---

### ⏱️ Token Budget
> *"Say everything you need to say — in under N tokens."*

A bloated prompt is shown alongside a strict token budget. Three options display real-time token count pills:

```
  A  │ What is blockchain and how does it work in simple terms…  │ 17t ✗  ← OVER BUDGET
  B  │ Blockchain for beginners.                                 │  4t ✓  ← Too vague
  C  │ Summarize blockchain in simple terms for a beginner.      │ 11t ✓  ← CORRECT
```

Only one option fits the budget **and** covers all required concepts.

---

### 🐉 Boss Battle
> *"The Token Boss has 100 HP. You have 5 rounds. Go."*

A gauntlet of 5 advanced challenges back-to-back. Each correct answer deals damage:

| Score | Damage | Message |
|-------|--------|---------|
| ≥ 85  | 30 HP  | CRITICAL HIT! 💥 |
| ≥ 70  | 20 HP  | STRONG HIT! ⚡ |
| ≥ 55  | 12 HP  | Good hit! ✨ |
| ≥ 40  | 6 HP   | Weak hit… |
| < 40  | 0 HP   | MISS! Boss attacks! 👾 |

---

## 👾 Villain Roster

Each villain represents a **real token-waste behavior** observed in AI prompts. Defeat all challenges linked to a villain to unlock their corresponding Zero-Waste Power.

| # | Villain | Emoji | Waste Pattern | Challenges | Power Unlocked |
|---|---------|-------|---------------|------------|----------------|
| 1 | **Verbosity Vampire** | 🧛 | Filler words, hedging language, excessive politeness | 1, 2, 9 | 🔪 Surgical Scalpel |
| 2 | **Déjà Vu Demon** | 👁️ | Repeating the same instruction multiple times | 4, 6 | 🔄 Deduplication Shield |
| 3 | **File Loop Phantom** | 👻 | Feeding entire files when only snippets are needed | 8, 14 | 📎 Surgical Context Clip |
| 4 | **Memory Hoarder** | 🐘 | Dumping full conversation history unnecessarily | 13, 19 | 🗜️ Context Compressor |
| 5 | **Context Goblin** | 👺 | Over-explaining background instead of stating the task | 5, 10 | 🎯 Zero-Shot Sniper |
| 6 | **Overengineered Overlord** | 🤖 | Multi-step prompts that could be one clean request | 11, 18 | 🧩 Atomic Decomposer |
| 7 | **Agent Anarchist** | 🔥 | Undefined agent loops with no exit conditions | 23, 25 | 🛑 Loop Breaker |
| 8 | **Infinite Reflector** | ♾️ | Asking AI to evaluate its own outputs repeatedly | 21, 24 | 🪞 One-Pass Oracle |
| 9 | **Analysis Paralytic** | 🧠 | Requesting exhaustive analysis when a summary suffices | 16, 22 | 📊 ROI Ranger |
| 10 | **History Hog** | 📚 | Injecting irrelevant prior context into every prompt | 3, 7, 12, 17 | 🗂️ Sliding Window Warden |
| 11 | **Overkill Oracle** | 💣 | Using 500-token prompts for tasks needing 20 | 15, 20 | ⚖️ Token Budget Master |

---

## ⚡ Zero-Waste Powers

Defeat villains to unlock these **13 architectural patterns** — the arsenal of a prompt engineer who never wastes a token.

<details>
<summary><strong>🔓 Click to expand full powers list</strong></summary>

| Power | Emoji | Concept | Unlocked By |
|-------|-------|---------|-------------|
| **Surgical Scalpel** | 🔪 | Reference only the relevant file section, not the whole file | Verbosity Vampire |
| **Deduplication Shield** | 🔄 | State each instruction once; trust the model to remember it | Déjà Vu Demon |
| **Surgical Context Clip** | 📎 | Pass a summarized diff or function signature, not the full source | File Loop Phantom |
| **Context Compressor** | 🗜️ | Summarize prior turns into a compact state block before continuing | Memory Hoarder |
| **Zero-Shot Sniper** | 🎯 | State the task directly with no preamble or backstory | Context Goblin |
| **Atomic Decomposer** | 🧩 | Break complex multi-part requests into single-purpose prompts | Overengineered Overlord |
| **Loop Breaker** | 🛑 | Define explicit exit conditions for every agent or agentic loop | Agent Anarchist |
| **One-Pass Oracle** | 🪞 | Trust the first structured output; avoid reflexive re-evaluation | Infinite Reflector |
| **Sliding Window Warden** | 🗂️ | Maintain only a rolling N-message window of conversation history | History Hog |
| **Token Budget Master** | ⚖️ | Set explicit token limits per response in your prompt | Overkill Oracle |
| **Schema Enforcer** | 📐 | Use JSON Schema or typed output to eliminate clarification rounds | Analysis Paralytic |
| **The Watcher** | 👁️ | Monitor token usage across sessions to catch drift early | Always Active |
| **ROI Ranger** | 📊 | Measure output quality per token to justify prompt investment | Always Active |

</details>

---

## 🏅 Badge System

| Badge | Icon | Condition |
|-------|------|-----------|
| First Strike | ⚔️ | Complete your first challenge |
| 100 Saved | 💰 | Save 100 total tokens |
| 500 Saved | 💎 | Save 500 total tokens |
| 1K Club | 🏆 | Save 1,000 total tokens |
| Legend | 👑 | Save 10,000 total tokens |
| On Fire | 🔥 | 3-day play streak |
| Unstoppable | ⚡ | 7-day play streak |
| Perfectionist | ✨ | Score 100% on any challenge |
| S-Rank | 🌟 | Earn an S grade |
| Combo Master | 💥 | Hit 5× combo multiplier |
| Boss Slayer | 🐉 | Defeat the Token Boss |
| Versatile | 🎯 | Complete all 3 game modes |

---

## 📊 Scoring Engine

TokenQuest uses a **fully local, heuristic scoring engine** — zero AI API calls required.

```js
// src/utils/scorer.js

totalScore =
  savingsScore   × 0.40   // Token reduction vs. original
  clarityScore   × 0.30   // Action verbs, output formats, tone, length constraints
  intentScore    × 0.20   // Required concepts coverage
  specificityScore × 0.10  // Structured output or length spec present

grade = totalScore >= 90 ? 'S'
      : totalScore >= 75 ? 'A'
      : totalScore >= 60 ? 'B'
      : totalScore >= 40 ? 'C' : 'D'
```

**Token estimation:** `estimateTokens(text) = Math.ceil(wordCount × 1.3)`

---

## 🗂 Architecture

```
zerotokens/
│
├── index.html                    # Vite entry point
├── vite.config.js                # Build config
├── tailwind.config.js            # Neon color palette + custom keyframes
│
└── src/
    ├── main.jsx                  # React root
    ├── App.jsx                   # Screen router (AnimatePresence)
    ├── index.css                 # Starfield, neon glow, CRT scanlines
    │
    ├── components/
    │   ├── screens/
    │   │   ├── LandingScreen.jsx     # First-time hero / Welcome-back dashboard
    │   │   ├── UsernameScreen.jsx    # First-play username entry
    │   │   ├── LevelMapScreen.jsx    # 25-challenge grid by level
    │   │   ├── GameScreen.jsx        # Unified A/B/C choice UI (all modes)
    │   │   ├── BossScreen.jsx        # 5-round HP boss gauntlet
    │   │   ├── ResultsScreen.jsx     # Score + badge + villain damage reveal
    │   │   ├── VillainsScreen.jsx    # Villain roster + powers arsenal
    │   │   └── BadgeShelfScreen.jsx  # Achievement collection
    │   │
    │   └── ui/
    │       ├── Header.jsx            # Nav bar with stats chips
    │       ├── Starfield.jsx         # Animated CSS star particles
    │       ├── RobotGuide.jsx        # Animated robot mascot + speech bubble
    │       ├── ScoreRing.jsx         # Animated SVG grade ring
    │       ├── TokenMeter.jsx        # Before/after token bar comparison
    │       └── CoinBurst.jsx         # Coin particle burst animation
    │
    ├── data/
    │   ├── challenges.json           # 25 challenges with A/B/C options
    │   └── villains.js               # 11 villains + 13 powers + progress helpers
    │
    ├── store/
    │   └── gameStore.js              # Zustand store — all game state + actions
    │
    └── utils/
        ├── scorer.js                 # Local heuristic scoring (no API)
        ├── tokenizer.js              # Word-count token estimator
        ├── sound.js                  # Web Audio API synth effects
        └── storage.js                # localStorage: active save + hidden archive
```

---

## 🧠 State & Persistence

```
┌──────────────────────────────────────────────────────────────────┐
│                        localStorage                              │
├──────────────────────────┬───────────────────────────────────────┤
│  token-quest-save        │  Active session (wiped on reset)      │
│                          │  username, coins, xp, streak,         │
│                          │  completedChallenges, badges,         │
│                          │  totalTokensSaved, theme, sound       │
├──────────────────────────┼───────────────────────────────────────┤
│  token-quest-archive     │  Hidden — NEVER wiped                 │
│                          │  ├─ sessions[]  ← full snapshot on    │
│                          │  │              every reset           │
│                          │  └─ attempts[]  ← every challenge     │
│                          │                 submission with:      │
│                          │                 originalPrompt        │
│                          │                 userInput (picked)    │
│                          │                 correctAnswer         │
│                          │                 grade, score, tokens  │
└──────────────────────────┴───────────────────────────────────────┘
```

> **Training Data Design:** Every challenge attempt is stored as a structured prompt-optimization pair. When integrated with a backend, `loadArchive()` from `storage.js` returns the full dataset ready for fine-tuning pipelines.

```js
// Example training record
{
  username:       "Token Hero",
  challengeId:    1,
  mode:           "fix_prompt",
  villain:        "verbosity_vampire",
  difficulty:     "beginner",
  originalPrompt: "Can you please maybe help me write something kind of like...",
  userInput:      "Write a concise professional email to my boss summarizing...",
  correctAnswer:  "Write a concise professional email to my boss summarizing...",
  isCorrect:      true,
  totalScore:     100,
  grade:          "S",
  tokensSaved:    35,
  _timestamp:     "2026-05-21T21:32:28.259Z"
}
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install & Run

```bash
# Clone the repo
git clone https://github.com/mannysinghx/zerotokens.git
cd zerotokens

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Build for Production

```bash
npm run build       # outputs to /dist
npm run preview     # preview the production build locally
```

---

## 🎨 Design System

### Color Palette

```
Neon Blue    #00d4ff   ████   Primary UI, XP, headings
Neon Purple  #a855f7   ████   Secondary accents, combos
Neon Green   #10b981   ████   Success states, tokens saved
Neon Amber   #f59e0b   ████   Coins, warnings, streaks
Neon Red     #ef4444   ████   Villains, errors, over-budget
```

### Typography

- **Display:** Exo 2 (Google Fonts) — headings, titles, logo
- **Mono:** JetBrains Mono (Google Fonts) — stats, scores, prompts

### Visual Effects

| Effect | Implementation |
|--------|---------------|
| Starfield | 80 CSS `<div>` particles with `--dur` / `--op` custom properties |
| Neon glow | `text-shadow` + `box-shadow` CSS utility classes |
| CRT scanlines | Repeating linear-gradient overlay at 2px intervals |
| Glitch | CSS `@keyframes glitch` with clip-path animation |
| Screen transitions | Framer Motion `AnimatePresence` with slide + fade |
| Confetti | `canvas-confetti` on S/A grade results |
| Sound FX | Web Audio API oscillator synthesis (no audio files) |

---

## 🔌 Tech Stack

| Layer | Library | Version | Why |
|-------|---------|---------|-----|
| UI Framework | React | 18 | Concurrent features, hooks |
| Build Tool | Vite | 5 | Fast HMR, ESM native |
| Styling | Tailwind CSS | 3 | Utility-first, custom design tokens |
| Animation | Framer Motion | 11 | Declarative spring animations |
| State | Zustand | 4 | Minimal boilerplate, devtools-ready |
| Confetti | canvas-confetti | latest | Lightweight canvas burst |
| Fonts | Google Fonts | — | Exo 2 + JetBrains Mono |

**Zero runtime dependencies** beyond the above. No AI API. No backend. No auth.

---

## 🗺️ Roadmap

- [ ] **Leaderboard** — sync scores to Supabase / PocketBase
- [ ] **Daily Challenge** — one fresh prompt per day with global rankings
- [ ] **Custom Challenges** — community-submitted villain patterns
- [ ] **Training Export** — one-click CSV/JSONL export of the hidden archive for fine-tuning
- [ ] **Backend API** — flush `token-quest-archive` to a database for agent training pipelines
- [ ] **PWA** — installable offline-first app
- [ ] **More Villains** — multimodal waste patterns (image tokens, audio transcripts)
- [ ] **Dark / Light themes** — additional color palettes

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

```bash
# Fork → clone → branch
git checkout -b feature/my-villain

# Make changes, then
npm run dev     # verify locally
git commit -m "feat: add The Emoji Spammer villain"
git push origin feature/my-villain
# → open PR
```

### Adding a New Challenge

1. Add an entry to `src/data/challenges.json`
2. Set `mode` to `fix_prompt`, `choose_best`, or `token_budget`
3. Add exactly 3 `options` — one `correctOption` index, two distractors
4. Set a `villain` id from `src/data/villains.js`
5. That's it — the game engine handles everything else

### Adding a New Villain

1. Add to the `VILLAINS` array in `src/data/villains.js`
2. Link `challengeIds` to your new challenges
3. Set a `power` id that matches an entry in `POWERS`

---

## 📄 License

MIT © [mannysinghx](https://github.com/mannysinghx)

---

<div align="center">

**Built with 🤖 + ⚡ to make every token count.**

*No login · No API keys · 100% client-side · Open source*

[![GitHub stars](https://img.shields.io/github/stars/mannysinghx/zerotokens?style=social)](https://github.com/mannysinghx/zerotokens)
[![GitHub forks](https://img.shields.io/github/forks/mannysinghx/zerotokens?style=social)](https://github.com/mannysinghx/zerotokens/fork)

</div>
