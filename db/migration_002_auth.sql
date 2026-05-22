-- Migration 002: Full auth system
-- Drops empty legacy tables, adds companies/users/sessions/email_verifications
-- Run in Neon Dashboard → SQL Editor

-- Drop legacy tables (all empty — safe to drop)
DROP TABLE IF EXISTS responses    CASCADE;
DROP TABLE IF EXISTS assignments  CASCADE;
DROP TABLE IF EXISTS employees    CASCADE;

-- ── Companies ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  domain     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Users (individual learners + company employees) ──────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT        UNIQUE,
  username       TEXT        NOT NULL,
  password_hash  TEXT,
  password_salt  TEXT,
  company_id     UUID        REFERENCES companies(id) ON DELETE SET NULL,
  user_type      TEXT        NOT NULL DEFAULT 'individual'
                             CHECK (user_type IN ('individual','company')),
  email_verified BOOLEAN     NOT NULL DEFAULT FALSE,
  team           TEXT,
  role           TEXT,
  category_id    TEXT        REFERENCES categories(id) ON DELETE SET NULL,
  game_state     JSONB       NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Sessions ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT        UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Email verifications ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_verifications (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT        UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Assignments (user_id = UUID now) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assignments (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id  TEXT        NOT NULL REFERENCES categories(id),
  sub_function TEXT,
  role         TEXT,
  assigned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  active       BOOLEAN     NOT NULL DEFAULT TRUE
);

-- ── Responses (user_id = UUID now) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS responses (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id    UUID        NOT NULL REFERENCES questions(id),
  category_id    TEXT        NOT NULL,
  user_answer    TEXT,
  correct_answer TEXT,
  is_correct     BOOLEAN,
  total_score    INTEGER,
  grade          TEXT,
  tokens_saved   INTEGER,
  answered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email       ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company     ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token    ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user     ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_verif_token       ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_assignments_user  ON assignments(user_id, active);
CREATE INDEX IF NOT EXISTS idx_responses_user    ON responses(user_id);
CREATE INDEX IF NOT EXISTS idx_responses_cat     ON responses(category_id);
CREATE INDEX IF NOT EXISTS idx_responses_time    ON responses(answered_at DESC);
