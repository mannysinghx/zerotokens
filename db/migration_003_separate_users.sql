-- Migration 003: Separate company employee data from individual user data
-- Creates employee_profiles table, migrates existing data, removes company
-- columns from the shared users table.
-- Run in Neon Dashboard → SQL Editor

-- ── 1. Create employee_profiles table ─────────────────────────────────────────
-- Holds company-specific identity data that does NOT belong on individual users.
CREATE TABLE IF NOT EXISTS employee_profiles (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  team       TEXT,
  role       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emp_profiles_user    ON employee_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_emp_profiles_company ON employee_profiles(company_id);

-- ── 2. Migrate existing company-employee rows ──────────────────────────────────
INSERT INTO employee_profiles (user_id, company_id, team, role)
SELECT id, company_id, team, role
FROM   users
WHERE  user_type = 'company'
  AND  company_id IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- ── 3. Drop company-specific columns from users ────────────────────────────────
-- individual users have never used these; company data now lives in employee_profiles.
ALTER TABLE users
  DROP COLUMN IF EXISTS company_id,
  DROP COLUMN IF EXISTS team,
  DROP COLUMN IF EXISTS role,
  DROP COLUMN IF EXISTS category_id;   -- denorm of assignments table; not used

-- ── 4. Clean up stale index ────────────────────────────────────────────────────
DROP INDEX IF EXISTS idx_users_company;
