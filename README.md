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

[▶ Play Now](https://www.zerotokens.ai) · [📖 Our Story](#-our-story) · [🏛 Zero Waste Architecture](#-zero-waste-token-architecture) · [🎮 Game Modes](#-game-modes) · [🏗 Tech Architecture](#-technical-architecture) · [🔐 Auth](#-authentication) · [⚙️ Setup](#-getting-started) · [📬 Contact](#-contact)

</div>

---

## 📖 Our Story

### The problem we couldn't ignore

While building AI-powered products for enterprise clients, we kept seeing the same pattern: intelligent developers writing **shockingly wasteful prompts**. Simple tasks that should cost fractions of a cent were consuming 10–50× more tokens than necessary. A single API call ballooning from 200 tokens to 2,000 for the exact same output.

Multiply that by a million calls per day and you're looking at **tens of thousands of dollars in avoidable cost** — every month, for a single application.

It wasn't that engineers were careless. They simply hadn't been taught to think in tokens. No one had. The tooling was new, the patterns were emerging, and the pricing model was invisible until the cloud bill arrived.

### The documentation that didn't stick

We started writing internal guides. Checklists. Code-review annotations. But documentation alone doesn't change behavior — especially not under deadline pressure. We needed something that made the *right habit* feel instinctive.

So we asked: **what if we made the mistake feel bad and the fix feel good?** What if every "wasteful prompt" was a villain that punished you — and rewriting it unleashed a superpower with a satisfying animation?

That question became Token Quest.

---

## 🏛 Zero Waste Token Architecture

Before the game, there was the **framework**. The Zero Waste Token Architecture (ZWTA) is the systematic methodology we developed to eliminate token waste across the full lifecycle of an LLM-powered product.

### The Four Root Causes

Every token-waste problem we've ever seen traces back to one of four root causes:

| Pattern | Description |
|---------|-------------|
| 🔄 **Redundancy** | Repeating context or instructions the model already has — re-stating the task, re-explaining the persona, duplicating output examples. |
| 💬 **Verbosity** | Padding, pleasantries, and over-explanation that adds zero signal. "Could you please kindly help me with..." burns tokens before the actual ask begins. |
| ❓ **Ambiguity** | Vague instructions that force the model to hedge, clarify, or hallucinate. The less specific the prompt, the longer (and more expensive) the model's self-correction loop. |
| 🎯 **Scope Creep** | Asking for too much in one call when a focused, decomposed query would cost less and produce a more reliable answer. |

### The ZWTA Cycle

```
  ┌──────────────────────────────────────────────────────────┐
  │                                                          │
  │   MEASURE ──► IDENTIFY ──► APPLY SUPERPOWER ──► VERIFY  │
  │       ▲                                          │       │
  │       └──────────────── iterate ─────────────────┘       │
  │                                                          │
  └──────────────────────────────────────────────────────────┘
```

1. **Measure** — baseline every prompt. Count input + output tokens before touching anything.
2. **Identify the Villain** — which of the 11 anti-patterns is driving the waste?
3. **Apply a Superpower** — use the matching counter-technique from the 13-superpower library.
4. **Verify the Gain** — re-measure. Calculate percentage reduction. Track over time.

The cycle compounds. A team that runs ZWTA consistently for 90 days typically reduces prompt token spend by 40–70% without degrading output quality.

### The 11 Token Waste Villains

Each villain is a named anti-pattern extracted from real production prompts:

| # | Villain | Anti-Pattern |
|---|---------|--------------|
| 1 | 🔄 The Repeater | Duplicates context already in the system prompt or conversation history |
| 2 | 💬 The Rambler | Buries the actual instruction in paragraphs of preamble |
| 3 | ❓ The Vague Commander | Issues commands with no specificity — what format? what length? what constraints? |
| 4 | 📜 The Over-Prompter | Sends 1,500 tokens of context to answer a 10-token question |
| 5 | 👻 The Hallucination Bait | Asks open-ended questions that force the model to invent facts |
| 6 | 🗂️ The Context Dumper | Pastes entire documents when only two paragraphs are relevant |
| 7 | 🎭 The Role Abuser | Invents elaborate 400-token personas for tasks that need no role |
| 8 | 🖨️ The Format Freak | Requests elaborate formatting that doubles output tokens unnecessarily |
| 9 | 🔁 The Loop Maker | Chains prompts that could be a single well-structured call |
| 10 | 🙏 The Polite Taxer | Loads every prompt with please/thank-you/apology overhead |
| 11 | ⛓️ The Chain Breaker | Breaks a coherent task into micro-calls, each re-sending full context |

### The 13 Zero-Waste Superpowers

Each superpower is a proven counter-technique:

| # | Superpower | Technique |
|---|------------|-----------|
| 1 | ⚡ Precision Strike | Replace vague verbs with exact action verbs and specific output specs |
| 2 | 🗜️ Context Compression | Summarize background context before sending; never send raw documents |
| 3 | 🎯 Intent Anchoring | Lead with the end goal, not the backstory |
| 4 | 📋 Output Contracting | Specify format, length, and structure upfront to constrain the response |
| 5 | 🦸 Role Framing | Use roles only when they genuinely improve output quality |
| 6 | 🔒 Constraint Binding | Add explicit limits: "in 3 bullet points", "under 50 words", "as JSON" |
| 7 | ✂️ Chain Pruning | Combine sequential micro-prompts into a single structured call |
| 8 | 💰 Token Budgeting | Allocate token budget to each prompt before writing it |
| 9 | 📐 Format Locking | Use markdown anchors only when the consumer needs them |
| 10 | 🛡️ Dedup Shield | Audit prompts for any phrase that appears more than once |
| 11 | 🔭 Scope Limiting | Decompose broad tasks; send only the slice relevant to this call |
| 12 | 📡 Signal Boosting | Replace hedged language ("could you perhaps") with direct imperatives |
| 13 | 🧲 Hallucination Guard | Constrain the model to provided context; forbid speculation by instruction |

---

## ✨ Features at a Glance

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        TOKENQUEST PLATFORM                              │
├──────────────────────────────┬──────────────────────────────────────────┤
│  🎮  25 Challenges            │  6 difficulty levels (Beginner → Expert) │
│  🎯  4 Game Modes             │  Fix / Choose / Budget / Boss Battle      │
│  👾  11 Villains              │  Each maps to a ZWTA anti-pattern         │
│  ⚡  13 Superpowers           │  Each maps to a ZWTA counter-technique    │
│  🏅  12 Badges                │  Achievement system with unlock conditions│
│  🐉  Boss Battle              │  5-round HP gauntlet                      │
│  🔥  Streak Tracking          │  Daily play streaks                       │
│  💥  Combo Multiplier         │  Chain correct answers for bonus XP       │
│  🔐  Full Auth System         │  Email verification, sessions, PBKDF2     │
│  🏢  Corporate Platform       │  Company admin, field certification       │
│  👑  Company Admin Portal     │  Promote admins, manage teams, view stats │
│  📊  Employee Profiles        │  Training activity, grade history, certs  │
│  📬  Email Delivery           │  Nodemailer + Gmail SMTP invite system    │
│  💾  Cloud Save               │  Game state synced to Neon PostgreSQL     │
│  ⏰  Idle Session Guard       │  30-min idle logout with 5-min warning    │
│  🌟  Neon CRT Aesthetic       │  Starfield, scanlines, animated villains  │
└──────────────────────────────┴──────────────────────────────────────────┘
```

---

## 🎮 Game Modes

### ⚔️ Fix Prompt
You're shown a bloated, wasteful prompt. Three rewritten versions appear as option cards. Pick the one that saves the most tokens while preserving full intent. Scored locally — zero AI API calls.

**Scoring weights:**
```
Token Savings  ████████████████████████████████  40%
Clarity        ████████████████████████          30%
Intent         ████████████████                  20%
Specificity    ████████                          10%
```

### 🎯 Choose Best
Three prompt variants for the same task. Identify the one with a clear action verb, specified output format, and constrained scope. Tests pattern recognition over optimization.

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

## 🏗 Technical Architecture

Token Quest is a hybrid edge/serverless app. The routing model separates public game, corporate admin, and email-delivery lambdas based on what each layer needs.

### Runtime Tiers

```
Browser (React 18 + Vite)
  │
  ├─ /                  →  App.jsx (Zustand state machine, screen router)
  ├─ /verify            →  VerifyEmailScreen (email token → session)
  ├─ /about             →  AboutScreen (static public page)
  ├─ /admin/*           →  AdminApp (super admin — x-admin-password header)
  └─ /company-admin/*   →  CompanyAdminApp (Bearer token, is_company_admin=TRUE)

Vercel Serverless Functions
  │
  ├─ Edge Runtime (fast cold start, Web Crypto, Neon HTTP driver)
  │    api/auth/verify-email.js
  │    api/auth/login.js
  │    api/company-admin/employees.js
  │    api/company-admin/assign.js
  │    api/company-admin/toggle-admin.js
  │    api/company-admin/employee-profile.js
  │    ...all non-SMTP endpoints
  │
  └─ Node.js Runtime (TCP/TLS for SMTP, process.env for credentials)
       api/auth/register.js
       api/company-admin/invite.js
       api/company-admin/add-employee.js
       api/company-admin/resend-invite.js
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **PBKDF2 via Web Crypto** | Bcrypt requires Node.js; Web Crypto runs on the Edge. PBKDF2 with 100k iterations + 256-bit key is equivalent strength and edge-safe. |
| **Neon PostgreSQL** | Serverless HTTP driver works on Edge. No persistent connections, no idle charges. |
| **Zustand game store** | Single source of truth for all game state. Persists to `localStorage` *and* syncs to DB on save/logout. |
| **Edge + Node.js hybrid** | SMTP requires TCP/TLS, which only Node.js lambdas support. Everything that doesn't need SMTP runs on the Edge for faster cold starts. |
| **No AI API calls at runtime** | All scoring, villain matching, and feedback is deterministic. Token Quest is about learning *to avoid* waste — it would be ironic to waste tokens answering questions about wasting tokens. |
| **React Router for top-level routes** | Game screens are store-driven (no URL changes). Top-level public routes (`/about`, `/verify`, `/admin`, `/company-admin`) use React Router for proper deep-linking and SEO. |

### File Map

```
/
├── api/                          Vercel serverless functions
│   ├── _db.js                    Neon Edge SQL client
│   ├── _db_node.js               Neon Node.js SQL client (SMTP lambdas)
│   ├── _auth.js                  PBKDF2 helpers, session creation, getCompanyAdmin()
│   ├── _email.js                 Nodemailer wrappers (invite, verify, reset)
│   ├── auth/
│   │   ├── register.js           Individual self-signup + email verification
│   │   ├── login.js              Credential check → session token
│   │   ├── logout.js             Invalidate session
│   │   ├── me.js                 Validate token → return user
│   │   ├── verify-email.js       Consume token → auto-login or prompt set-password
│   │   └── set-password.js       First-time password for company invites
│   ├── admin/                    Super-admin endpoints (x-admin-password)
│   │   ├── stats.js
│   │   ├── employees.js
│   │   ├── companies.js
│   │   ├── invite.js
│   │   ├── assign.js
│   │   ├── responses.js
│   │   └── user-manage.js        disable/enable/delete/set-password/promote/demote
│   ├── company-admin/            Company-scoped endpoints (Bearer + is_company_admin)
│   │   ├── me.js
│   │   ├── employees.js
│   │   ├── add-employee.js       Create with preset password + send verify email
│   │   ├── invite.js             Invite-only (employee sets own password)
│   │   ├── resend-invite.js      Re-send invite for pending employees
│   │   ├── assign.js             Course assignment
│   │   ├── update-employee.js    Edit username / email
│   │   ├── toggle-admin.js       Promote / demote company admin
│   │   ├── employee-profile.js   Full profile + activity stats
│   │   └── user-manage.js        disable/enable/delete/set-password
│   ├── game/
│   │   └── progress.js           Save game state JSON
│   ├── employees/
│   │   └── assignment.js         Fetch active course for logged-in employee
│   └── responses/
│       └── save.js               Record a completed question response
│
└── src/                          React frontend
    ├── main.jsx                  React Router — /about, /verify, /admin, /company-admin, /*
    ├── App.jsx                   Zustand screen router + idle timer
    ├── store/
    │   └── gameStore.js          All game + auth state (Zustand + localStorage)
    ├── hooks/
    │   └── useIdleTimer.js       30-min idle logout with 25-min warning
    ├── utils/
    │   └── api.js                All fetch wrappers (auth, game, admin, company-admin)
    ├── data/
    │   ├── challenges.json       25 prompt challenges (mode, options, villain mapping)
    │   ├── villains.js           11 villain definitions + defeat tracking
    │   ├── badges.js             12 badge unlock conditions
    │   ├── certifications.js     Certification tier rules
    │   └── fieldCategories.js    Field training categories + FIELD_CATEGORY_MAP
    ├── components/
    │   ├── screens/              All game + auth screens
    │   │   ├── AboutScreen.jsx   Public /about page
    │   │   ├── LandingScreen.jsx Authenticated home (stats, continue, field training)
    │   │   ├── UserTypeScreen.jsx Login gateway (company / individual)
    │   │   ├── GameScreen.jsx    Core game loop
    │   │   └── ...               (11 more screens)
    │   └── ui/                   Shared UI components (Header, CertBadge, IdleWarningModal…)
    ├── admin/                    Super-admin panel (/admin/*)
    │   ├── AdminApp.jsx
    │   ├── pages/                Stats, EmployeeManager, Responses, Companies
    │   └── components/           AssignmentModal, UserActionModal
    └── company-admin/            Company admin portal (/company-admin/*)
        ├── CompanyAdminApp.jsx
        ├── pages/                CoDashboard, CoEmployees
        └── components/           AddEmployeeModal, EmployeeProfileModal
```

---

## 🔐 Authentication

Two completely separate auth systems co-exist:

### Individual / Company Employee Auth

```
POST /api/auth/register      →  Hash password (PBKDF2) → create user → send verify email
GET  /verify?token=...       →  Validate token →
                                  password_hash present?  → auto-login (create session)
                                  no password_hash?       → show set-password form
POST /api/auth/set-password  →  Hash new password → mark token used → create session → auto-login
POST /api/auth/login         →  PBKDF2 verify → create 30-day session → return Bearer token
POST /api/auth/logout        →  Delete session row
GET  /api/auth/me            →  Validate Bearer → return user object
```

### Company Admin Auth

Company admins are regular company employees with `employee_profiles.is_company_admin = TRUE`. They authenticate identically to employees, then every company-admin API call validates:

```sql
SELECT u.*, ep.company_id, ep.is_company_admin
FROM sessions s
JOIN users u ON u.id = s.user_id
JOIN employee_profiles ep ON ep.user_id = u.id
WHERE s.token = $bearerToken
  AND s.expires_at > NOW()
  AND ep.is_company_admin = TRUE
```

### Super Admin Auth

Separate from the above. The super-admin panel (`/admin/*`) uses a static `x-admin-password` header. No session, no user row — just an env var checked server-side.

### Password Hashing

```javascript
// PBKDF2 via Web Crypto API — edge-compatible (no bcrypt)
const salt = generateSalt()           // 16-byte hex
const hash = await hashPassword(password, salt)
//   → PBKDF2-SHA256, 100,000 iterations, 256-bit key
//   → stored as hex in users.password_hash / users.password_salt
```

### Session Security

- 30-day sessions stored in `sessions` table
- Session token: 48-byte cryptographically random hex (96 chars)
- On logout: session row deleted; game state saved to DB first
- On idle (30 min): warning modal at 25 min; auto-logout at 30 min
- Company admin portal: sessions in `sessionStorage` (not `localStorage`) — cleared on tab close

---

## 🗄 Database Schema

```sql
-- Core user table
users (
  id              SERIAL PRIMARY KEY,
  email           TEXT UNIQUE NOT NULL,
  username        TEXT NOT NULL,
  password_hash   TEXT,                -- null until verified (company invite flow)
  password_salt   TEXT,
  user_type       TEXT NOT NULL,       -- 'individual' | 'company'
  email_verified  BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
)

-- Company accounts
companies (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL,
  domain TEXT
)

-- Company employee metadata
employee_profiles (
  user_id          INTEGER REFERENCES users(id) ON DELETE CASCADE,
  company_id       INTEGER REFERENCES companies(id),
  team             TEXT,
  role             TEXT,
  is_company_admin BOOLEAN NOT NULL DEFAULT FALSE
)

-- Session tokens
sessions (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Email verification + invite tokens
email_verifications (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Course / field-training assignments
assignments (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
  category_id  TEXT NOT NULL,
  sub_function TEXT,
  role         TEXT,
  active       BOOLEAN DEFAULT TRUE,
  assigned_at  TIMESTAMPTZ DEFAULT NOW()
)

-- Question responses (field training)
responses (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER REFERENCES users(id) ON DELETE CASCADE,
  question_id    INTEGER,
  category_id    TEXT,
  user_answer    TEXT,
  correct_answer TEXT,
  is_correct     BOOLEAN,
  total_score    NUMERIC,
  grade          TEXT,
  tokens_saved   NUMERIC,
  answered_at    TIMESTAMPTZ DEFAULT NOW()
)

-- Game state (JSON blob per user)
game_progress (
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  game_state JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

---

## 💡 Corporate Platform

Companies access a dedicated admin portal at `/company-admin` — completely separate from the public game.

### Access Model

```
Super Admin (/admin)
  └── Can: manage all companies, promote employees to company admin,
           view all responses, create companies, global stats

Company Admin (/company-admin)
  └── Can: manage own company employees only
           add employees (preset password or invite-only)
           assign courses, promote/demote other company admins
           view employee profiles + training stats + grades
           disable/enable/delete accounts, change passwords
           company admins cannot access other companies' data
```

### Employee Lifecycle

```
1. Company Admin adds employee
   ├─ "Add Employee" (with password)  →  account created, verify email sent,
   │                                     employee clicks → auto-login
   └─ "Invite" (no preset password)  →  account created, invite email sent,
                                        employee clicks → set-password form → login

2. Employee verified → Admin assigns course (Category → Sub-function → Role)

3. Employee completes field training → Grades + responses tracked

4. Admin views Employee Profile modal:
   - Edit username / email
   - Course assignment history
   - Response stats (total, % correct, avg score, grade distribution)
   - Toggle company admin status
   - Account management (password, disable, delete)
```

---

## 🎨 Design System

### Color Palette

```
Neon Blue    #00d4ff   ████   Primary UI, XP, headings, links
Neon Purple  #a855f7   ████   Secondary accents, company admin, combos
Neon Green   #10b981   ████   Success states, tokens saved, correct answers
Neon Amber   #f59e0b   ████   Coins, warnings, streaks, scores
Neon Red     #ef4444   ████   Villains, errors, over-budget, disabled
Slate-950    #020617   ████   Background — deep space black
```

### Typography

- **Display:** Exo 2 — headings, titles, logo, villain names
- **Mono:** JetBrains Mono — stats, scores, prompts, code, all UI labels

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

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database
- A Gmail account with [App Password](https://myaccount.google.com/apppasswords) enabled
- [Vercel CLI](https://vercel.com/docs/cli) (for deployment)

### Local Development

```bash
git clone https://github.com/mannysinghx/zerotokens.git
cd zerotokens
npm install
```

Create `.env.local`:

```env
DATABASE_URL=postgresql://...         # Neon connection string
SMTP_USER=your@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx     # Gmail App Password (16 chars)
SMTP_FROM=Token Quest <your@gmail.com>
APP_URL=http://localhost:5173
ADMIN_PASSWORD=your-super-admin-password
```

```bash
npm run dev         # starts Vite on :5173
vercel dev          # starts Vercel dev server with API routes
```

> The game itself works without any environment variables. Auth, email, and cloud-save require the full stack.

### Deployment

```bash
vercel --prod
```

Set environment variables in the Vercel dashboard (or via `vercel env add`). Use the Node.js runtime for SMTP endpoints — they're already configured via `export const config = { runtime: 'edge' }` (or its absence).

---

## 🗺️ Roadmap

- [x] Gamified prompt learning (25 challenges, 4 modes, boss battle)
- [x] Zero Waste Token Architecture — 11 villains, 13 superpowers
- [x] Full authentication — email verification, PBKDF2, 30-day sessions
- [x] Corporate mode — company admin panel, employee management
- [x] Company admin portal — separate route, team management, role-based access
- [x] Employee add with preset password — admin-controlled onboarding
- [x] Employee profile modal — stats, grades, course history
- [x] Promote/demote company admins — within company scope
- [x] Field training — category assignments, question bank, response tracking
- [x] Cloud save — game state persisted to Neon
- [x] Idle session logout — 30-min with warning at 25 min
- [x] About page — origin story + architecture explained at /about
- [ ] Daily Challenge — one fresh prompt per day with global rankings
- [ ] Custom Challenges — community-submitted villain patterns
- [ ] Training Export — one-click CSV export of team completion data
- [ ] API Webhooks — notify your HR system on certification completion
- [ ] PWA — installable offline-first app
- [ ] Multi-language — prompting patterns are language-universal

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

### Adding a villain

1. Add to `src/data/villains.js` with `id`, `name`, `emoji`, `description`, and `weakness`
2. Reference the villain `id` in your challenge entries

---

## 📬 Contact

Built and maintained by [mannysinghx](https://github.com/mannysinghx).

For enterprise training enquiries, bug reports, or contributions:

**📧 zerotokensai@gmail.com**

---

## 📄 License

MIT © [mannysinghx](https://github.com/mannysinghx)

---

<div align="center">

**Built with 🤖 + ⚡ to make every token count.**

*Live at [zerotokens.ai](https://www.zerotokens.ai) · About at [zerotokens.ai/about](https://www.zerotokens.ai/about)*

[![GitHub stars](https://img.shields.io/github/stars/mannysinghx/zerotokens?style=social)](https://github.com/mannysinghx/zerotokens)
[![GitHub forks](https://img.shields.io/github/forks/mannysinghx/zerotokens?style=social)](https://github.com/mannysinghx/zerotokens/fork)

</div>
