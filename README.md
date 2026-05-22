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
[![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E5A0?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)
[![Vercel](https://img.shields.io/badge/Vercel-Serverless-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-ff69b4?style=for-the-badge)](https://github.com/mannysinghx/zerotokens/pulls)

<br/>

> **TokenQuest** is a gamified learning platform that teaches you to write lean, powerful AI prompts.
> Fight 11 token-waste villains, unlock 13 zero-waste superpowers, and climb the ranks from Beginner to Master.
> Available for **individual learners** (self-signup) and **corporate teams** (admin-managed with field training certification).

<br/>

[▶ Play Now](https://www.zerotokens.ai) · [🎮 Game Modes](#-game-modes) · [🏗 Architecture](#-architecture) · [🔐 Auth System](#-authentication) · [🗄 Database](#-database-schema) · [⚙️ Setup](#-getting-started)

</div>

---

## ✨ Features at a Glance

```
┌─────────────────────────────────────────────────────────────────────┐
│                       TOKENQUEST FEATURES                           │
├──────────────────────────┬──────────────────────────────────────────┤
│  🎮  25 Challenges        │  6 difficulty levels (Beginner → Expert) │
│  🎯  3 Game Modes         │  Fix Prompt / Choose Best / Token Budget  │
│  👾  11 Villains          │  Each maps to a specific prompt-waste trap│
│  ⚡  13 Powers            │  Zero-waste architecture patterns         │
│  🏅  12 Badges            │  Achievement system with unlock conditions│
│  🐉  Boss Battle          │  5-round HP gauntlet                      │
│  🔥  Streak Tracking      │  Daily play streaks                       │
│  💥  Combo Multiplier     │  Chain correct answers for bonus XP       │
│  🔐  Full Auth System     │  Email verification, sessions, PBKDF2     │
│  🏢  Corporate Mode       │  Admin panel, field training, cert reports│
│  📊  Admin Dashboard      │  Stats, employee management, responses    │
│  💾  Cloud Save           │  Game state synced to Neon PostgreSQL     │
│  📬  Email Verification   │  Nodemailer + Gmail SMTP                  │
│  🌟  Neon CRT Aesthetic   │  Starfield, scanlines, glow effects       │
└──────────────────────────┴──────────────────────────────────────────┘
```

---

## 🎮 Game Modes

### ⚔️ Fix Prompt
You're shown a bloated prompt. Three rewritten versions appear as option cards. Pick the one that saves the most tokens while preserving full intent.

**Scoring (local heuristic engine — zero AI API calls):**
```
Token Savings  ████████████████████████████████  40%
Clarity        ████████████████████████          30%
Intent         ████████████████                  20%
Specificity    ████████                          10%
```

### 🎯 Choose Best
Three prompt variants for the same task. Identify the one with a clear action verb, specified output format, and constrained scope.

### ⏱️ Token Budget
A bloated prompt + a strict token budget. Pick the option that fits within budget *and* covers all required concepts.

```
  A  │ What is blockchain and how does it work in simple terms…  │ 17t ✗  OVER BUDGET
  B  │ Blockchain for beginners.                                 │  4t ✓  Too vague
  C  │ Summarize blockchain in simple terms for a beginner.      │ 11t ✓  CORRECT
```

### 🐉 Boss Battle
5-round HP gauntlet. Each correct answer deals damage:

| Score | Damage |
|-------|--------|
| ≥ 85  | 30 HP — CRITICAL HIT! 💥 |
| ≥ 70  | 20 HP — STRONG HIT! ⚡ |
| ≥ 55  | 12 HP — Good hit ✨ |
| ≥ 40  | 6 HP  — Weak hit |
| < 40  | 0 HP  — MISS! |

---

## 👾 Villain Roster

| # | Villain | Waste Pattern | Power Unlocked |
|---|---------|---------------|----------------|
| 1 | 🧛 Verbosity Vampire | Filler words, hedging language | 🔪 Surgical Scalpel |
| 2 | 👁️ Déjà Vu Demon | Repeating the same instruction | 🔄 Deduplication Shield |
| 3 | 👻 File Loop Phantom | Feeding entire files unnecessarily | 📎 Surgical Context Clip |
| 4 | 🐘 Memory Hoarder | Dumping full conversation history | 🗜️ Context Compressor |
| 5 | 👺 Context Goblin | Over-explaining background | 🎯 Zero-Shot Sniper |
| 6 | 🤖 Overengineered Overlord | Multi-step prompts that could be one | 🧩 Atomic Decomposer |
| 7 | 🔥 Agent Anarchist | Undefined agent loops | 🛑 Loop Breaker |
| 8 | ♾️ Infinite Reflector | AI evaluating its own outputs repeatedly | 🪞 One-Pass Oracle |
| 9 | 🧠 Analysis Paralytic | Exhaustive analysis when a summary suffices | 📊 ROI Ranger |
| 10 | 📚 History Hog | Injecting irrelevant prior context | 🗂️ Sliding Window Warden |
| 11 | 💣 Overkill Oracle | 500-token prompts for 20-token tasks | ⚖️ Token Budget Master |

---

## 🏗 Architecture

```
TokenSaver/
├── api/                          # Vercel serverless functions
│   ├── _auth.js                  # PBKDF2 hashing, session tokens, getSessionUser
│   ├── _db.js                    # Neon SQL client, CORS, admin auth header
│   ├── _email.js                 # Nodemailer SMTP (verification + invites + reset)
│   │
│   ├── auth/
│   │   ├── register.js           # POST — create individual account, send verify email
│   │   ├── login.js              # POST — email + password login
│   │   ├── verify-email.js       # POST — validate token, auto-login if password set
│   │   ├── set-password.js       # POST — set password for invited employees
│   │   ├── me.js                 # GET  — validate session, return user
│   │   └── logout.js             # POST — delete session
│   │
│   ├── admin/
│   │   ├── invite.js             # POST — create company employee, send invite email
│   │   ├── employees.js          # GET  — list company employees (with profiles)
│   │   ├── individuals.js        # GET  — list individual learners separately
│   │   ├── companies.js          # GET/POST — manage companies
│   │   ├── assign.js             # POST — assign employee to training category
│   │   ├── responses.js          # GET  — view question responses (admin)
│   │   └── stats.js              # GET  — dashboard stats split by user type
│   │
│   ├── employees/
│   │   └── assignment.js         # GET  — fetch active training assignment for user
│   │
│   ├── game/
│   │   └── progress.js           # POST — persist game_state to DB
│   │
│   ├── questions/
│   │   └── field.js              # GET  — fetch randomised field-training questions
│   │
│   └── responses/
│       └── save.js               # POST — save a completed question response
│
├── db/
│   ├── schema.sql                # Legacy schema (categories, questions)
│   ├── migration_002_auth.sql    # Auth tables (users, sessions, email_verifications)
│   ├── migration_003_separate_users.sql  # Splits employee_profiles out of users
│   └── migrate.js                # Migration runner script
│
├── src/                          # React frontend (Vite)
│   ├── App.jsx                   # Screen router with AnimatePresence
│   ├── store/gameStore.js        # Zustand — auth state + game progress
│   ├── utils/
│   │   ├── api.js                # All fetch calls to /api/* routes
│   │   ├── storage.js            # localStorage helpers
│   │   ├── scorer.js             # Local heuristic scoring engine
│   │   └── elo.js / spacedRepetition.js / leaderboard.js
│   └── components/
│       ├── screens/
│       │   ├── LandingScreen.jsx
│       │   ├── UserTypeScreen.jsx          # individual vs company selector
│       │   ├── IndividualSignupScreen.jsx  # sign up + login tabs
│       │   ├── CompanyLoginScreen.jsx      # company employee login
│       │   ├── VerifyEmailScreen.jsx       # email verification + password setup
│       │   ├── EmployeeRegistrationScreen.jsx
│       │   ├── LevelMapScreen.jsx
│       │   ├── GameScreen.jsx
│       │   ├── BossScreen.jsx
│       │   └── ResultsScreen.jsx
│       └── ui/  Header, Starfield, RobotGuide, ScoreRing, TokenMeter, CoinBurst
│
├── .env.local                    # Environment variables (never committed)
└── vite.config.js
```

---

## 🔐 Authentication

Two distinct user types share the same auth infrastructure but are stored in separate tables.

### Individual Learners (self-service)

```
1. POST /api/auth/register
   └─ Creates user (email_verified=FALSE), inserts email_verifications token
   └─ Sends "Verify Email & Play" email (24-hour link)
   └─ Returns { message } — NO session issued yet

2. User clicks link → /verify?token=...
   └─ POST /api/auth/verify-email
   └─ Marks email_verified=TRUE, marks token used
   └─ Creates 30-day session → returns { user, sessionToken }
   └─ Frontend auto-logs user in → landing screen

3. Subsequent visits: session token in localStorage
   └─ GET /api/auth/me validates against sessions table
```

### Company Employees (admin-invited)

```
1. Admin: POST /api/admin/invite { email, username, companyId }
   └─ Creates user (user_type='company', email_verified=FALSE)
   └─ Creates employee_profiles row (company_id)
   └─ Sends "Accept Invitation" email (7-day link)

2. Employee clicks link → /verify?token=...
   └─ POST /api/auth/verify-email → { needsPassword: true }
   └─ Employee sets password via VerifyEmailScreen form

3. POST /api/auth/set-password { token, password }
   └─ Hashes password (PBKDF2-SHA256, 100k iterations)
   └─ Marks email_verified=TRUE, token used
   └─ Creates session → returns { user, sessionToken }
```

### Session & Password Security

| Mechanism | Detail |
|-----------|--------|
| Password hashing | PBKDF2-SHA256, 100,000 iterations, 16-byte random salt |
| Session tokens | 96-char hex (48 random bytes via Web Crypto) |
| Session storage | `sessions` table with 30-day expiry — server-side invalidation |
| Verification tokens | `email_verifications` table — one-time use, time-limited |
| CORS | Locked to `zerotokens.ai` + `localhost` in dev |

---

## 🗄 Database Schema

Hosted on **Neon PostgreSQL** (serverless). Two migrations bring the full schema.

### Core tables

```sql
-- Auth identity (shared by both user types)
users (
  id, email, username,
  password_hash, password_salt,
  user_type        TEXT  CHECK ('individual' | 'company'),
  email_verified   BOOLEAN,
  game_state       JSONB,
  created_at, updated_at
)

-- Company-specific data — separated from users in migration 003
employee_profiles (
  id, user_id → users(id),
  company_id → companies(id),
  team, role,
  created_at, updated_at
)

-- Auth sessions (30-day bearer tokens)
sessions (
  id, user_id → users(id),
  token  TEXT UNIQUE,
  expires_at TIMESTAMPTZ
)

-- One-time email verification tokens
email_verifications (
  id, user_id → users(id),
  token  TEXT UNIQUE,
  expires_at TIMESTAMPTZ,
  used  BOOLEAN DEFAULT FALSE
)

-- Corporate company accounts
companies (id, name, domain, created_at)

-- Admin-assigned training categories per employee
assignments (
  id, user_id → users(id),
  category_id, sub_function, role,
  assigned_at, active BOOLEAN
)

-- Field training question responses
responses (
  id, user_id → users(id),
  question_id → questions(id),
  category_id, user_answer, correct_answer,
  is_correct, total_score, grade, tokens_saved,
  answered_at
)
```

### Why `employee_profiles` is separate

`users` is a clean auth table — email, password hash, verification state, game progress.
Company-specific fields (`company_id`, `team`, `role`) live in `employee_profiles`, joined only when needed. Individual learners have **zero NULL columns** from corporate data.

---

## 📡 API Reference

All routes live under `/api/`. Edge runtime unless noted.

### Auth

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/auth/register` | — | Register individual user, send verify email |
| `POST` | `/api/auth/login` | — | Email + password login |
| `POST` | `/api/auth/verify-email` | — | Validate token; auto-login if password set |
| `POST` | `/api/auth/set-password` | — | Set password for invited employee |
| `GET`  | `/api/auth/me` | Bearer | Return current user from session |
| `POST` | `/api/auth/logout` | Bearer | Invalidate session |

### Game

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/game/progress` | Bearer | Persist `game_state` JSON to DB |
| `GET`  | `/api/questions/field` | — | Random field-training questions by category |
| `POST` | `/api/responses/save` | Bearer | Save a completed question response |
| `GET`  | `/api/employees/assignment` | Bearer | Get active training assignment |

### Admin (`x-admin-password` header required)

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/admin/invite` | Create employee + send invite email |
| `GET`  | `/api/admin/employees` | List company employees (with profiles) |
| `GET`  | `/api/admin/individuals` | List individual self-registered learners |
| `GET`  | `/api/admin/companies` | List all companies with employee counts |
| `POST` | `/api/admin/companies` | Create a company |
| `POST` | `/api/admin/assign` | Assign employee to a training category |
| `GET`  | `/api/admin/responses` | View responses (filterable by user/category) |
| `GET`  | `/api/admin/stats` | Dashboard stats split by user type |

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

## 🔌 Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 18 + Vite 5 | Fast HMR, ESM native |
| Styling | Tailwind CSS 3 | Custom neon palette |
| Animation | Framer Motion 11 | Spring animations, `AnimatePresence` |
| State | Zustand 4 | Auth + game state, localStorage sync |
| Backend | Vercel Serverless | Edge + Node.js functions |
| Database | Neon PostgreSQL | Serverless, HTTP-based via `@neondatabase/serverless` |
| Auth | Custom sessions | PBKDF2-SHA256, bearer tokens, DB-backed sessions |
| Email | Nodemailer + Gmail SMTP | Verification, invitations, password reset |

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database
- A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833) for SMTP
- [Vercel CLI](https://vercel.com/docs/cli) for local API development

### 1 — Clone & install

```bash
git clone https://github.com/mannysinghx/zerotokens.git
cd zerotokens
npm install
```

### 2 — Environment variables

Create `.env.local` in the project root:

```env
# Neon database (get from Neon dashboard → Connection Details)
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require

# Admin panel password (choose something secure)
ADMIN_PASSWORD=your-admin-password

# Gmail SMTP — use an App Password, not your account password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
SMTP_FROM=Token Quest <you@gmail.com>

# Your deployment URL (used in email links)
APP_URL=http://localhost:3000
```

### 3 — Run database migrations

Open your [Neon SQL Editor](https://console.neon.tech) and run each migration in order:

```bash
# Or use the migration runner:
node db/migrate.js       # migration 002 — auth system
```

For migration 003 (user data separation), run `db/migration_003_separate_users.sql` directly in the Neon dashboard SQL editor.

### 4 — Start the development server

```bash
# Frontend only (no API)
npm run dev

# Frontend + API routes together (requires Vercel CLI)
vercel dev
```

Open **http://localhost:5173** (Vite) or **http://localhost:3000** (Vercel dev).

### 5 — Build for production

```bash
npm run build       # outputs to /dist
npm run preview     # preview production build locally
```

Deploy to Vercel:
```bash
vercel --prod
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

- **Display:** Exo 2 — headings, titles, logo
- **Mono:** JetBrains Mono — stats, scores, prompts, code

### Visual Effects

| Effect | Implementation |
|--------|----------------|
| Starfield | 80 CSS `<div>` particles with `--dur` / `--op` custom properties |
| Neon glow | `text-shadow` + `box-shadow` utility classes |
| CRT scanlines | Repeating linear-gradient overlay at 2px intervals |
| Screen transitions | Framer Motion `AnimatePresence` with slide + fade |
| Confetti | `canvas-confetti` on S/A grade results |
| Sound FX | Web Audio API oscillator synthesis — no audio files |

---

## 🗺️ Roadmap

- [x] Gamified prompt learning (25 challenges, 3 modes, boss battle)
- [x] Full authentication — email verification, PBKDF2, 30-day sessions
- [x] Corporate mode — admin panel, company management, employee invites
- [x] Field training — category assignments, question bank, response tracking
- [x] Separated data model — `employee_profiles` decoupled from `users`
- [x] Cloud save — game state persisted to Neon
- [ ] Daily Challenge — one fresh prompt per day with global rankings
- [ ] Custom Challenges — community-submitted villain patterns
- [ ] Training Export — one-click CSV/JSONL export for fine-tuning pipelines
- [ ] PWA — installable offline-first app
- [ ] More Villains — multimodal waste patterns (image tokens, audio)

---

## 🤝 Contributing

Pull requests are welcome. For major changes please open an issue first.

```bash
git checkout -b feature/my-villain
npm run dev        # verify locally
git commit -m "feat: add The Emoji Spammer villain"
git push origin feature/my-villain
# → open PR
```

### Adding a challenge

1. Add an entry to `src/data/challenges.json` with `mode`, 3 `options`, `correctOption`, and `villain`
2. The game engine handles everything else automatically

---

## 📄 License

MIT © [mannysinghx](https://github.com/mannysinghx)

---

<div align="center">

**Built with 🤖 + ⚡ to make every token count.**

*Live at [zerotokens.ai](https://www.zerotokens.ai)*

[![GitHub stars](https://img.shields.io/github/stars/mannysinghx/zerotokens?style=social)](https://github.com/mannysinghx/zerotokens)
[![GitHub forks](https://img.shields.io/github/forks/mannysinghx/zerotokens?style=social)](https://github.com/mannysinghx/zerotokens/fork)

</div>
