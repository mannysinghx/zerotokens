-- TokenQuest Corporate Field Training — Neon PostgreSQL Schema
-- Run this once in your Neon dashboard → SQL Editor

-- 1. Categories (6 rows, seeded by seed.js)
CREATE TABLE IF NOT EXISTS categories (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  sub_functions  JSONB NOT NULL
);

-- 2. Questions (600 rows, 100 per category, seeded by seed.js)
CREATE TABLE IF NOT EXISTS questions (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     TEXT    NOT NULL REFERENCES categories(id),
  sub_function    TEXT    NOT NULL,
  mode            TEXT    NOT NULL CHECK (mode IN ('fix_prompt','choose_best','token_budget')),
  difficulty      TEXT    NOT NULL CHECK (difficulty IN ('beginner','intermediate','advanced','expert')),
  title           TEXT    NOT NULL,
  original_prompt TEXT    NOT NULL,
  options         JSONB   NOT NULL,
  correct_option  INTEGER NOT NULL,
  reward_coins    INTEGER NOT NULL DEFAULT 80,
  hint            TEXT,
  max_tokens      INTEGER
);

-- 3. Employees (upserted from app on registration / login)
CREATE TABLE IF NOT EXISTS employees (
  id         TEXT PRIMARY KEY,
  username   TEXT        NOT NULL,
  team       TEXT,
  company    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Assignments (admin assigns employee → category + role)
CREATE TABLE IF NOT EXISTS assignments (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id  TEXT        NOT NULL REFERENCES employees(id),
  category_id  TEXT        NOT NULL REFERENCES categories(id),
  sub_function TEXT,
  role         TEXT,
  assigned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  active       BOOLEAN     NOT NULL DEFAULT TRUE
);

-- 5. Responses (one row per question attempt)
CREATE TABLE IF NOT EXISTS responses (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id    TEXT        NOT NULL REFERENCES employees(id),
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

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_assignments_employee ON assignments(employee_id, active);
CREATE INDEX IF NOT EXISTS idx_responses_employee ON responses(employee_id);
CREATE INDEX IF NOT EXISTS idx_responses_category ON responses(category_id);
CREATE INDEX IF NOT EXISTS idx_responses_answered ON responses(answered_at DESC);
