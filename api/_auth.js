/**
 * api/_auth.js
 * Shared auth helpers: PBKDF2 password hashing (Web Crypto, Edge-compatible),
 * session token generation, and session validation.
 */
import { sql } from './_db.js'

// ── Password hashing (PBKDF2 via Web Crypto API) ──────────────────────────────

const ITERATIONS  = 100_000
const KEY_BITS    = 256

export function generateSalt() {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function hashPassword(password, salt) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial, KEY_BITS
  )
  return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(password, salt, storedHash) {
  const hash = await hashPassword(password, salt)
  if (hash.length !== storedHash.length) return false
  // Constant-time comparison to prevent timing attacks
  let diff = 0
  for (let i = 0; i < hash.length; i++) {
    diff |= hash.charCodeAt(i) ^ storedHash.charCodeAt(i)
  }
  return diff === 0
}

// ── Session tokens ────────────────────────────────────────────────────────────

export function generateToken(bytes = 48) {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
}

const SESSION_TTL_DAYS = 30

export async function createSession(userId) {
  const token     = generateToken()
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86400_000)
  await sql`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
  `
  return token
}

/**
 * Validates Bearer token from Authorization header.
 * Returns the full user row, or null if invalid/expired.
 */
export async function getSessionUser(request) {
  const header = request.headers.get('authorization') ?? ''
  const token  = header.startsWith('Bearer ') ? header.slice(7).trim() : null
  if (!token) return null

  const rows = await sql`
    SELECT u.*,
           ep.company_id, ep.team, ep.role,
           c.name AS company_name,
           s.expires_at AS session_expires
    FROM   sessions s
    JOIN   users             u  ON u.id  = s.user_id
    LEFT JOIN employee_profiles ep ON ep.user_id  = u.id
    LEFT JOIN companies      c  ON c.id  = ep.company_id
    WHERE  s.token = ${token}
      AND  s.expires_at > NOW()
    LIMIT  1
  `
  return rows[0] ?? null
}

/**
 * Reads userId from Bearer token (lighter — no user JOIN).
 */
export async function getUserIdFromToken(token) {
  if (!token) return null
  const rows = await sql`
    SELECT user_id FROM sessions
    WHERE  token = ${token} AND expires_at > NOW()
    LIMIT  1
  `
  return rows[0]?.user_id ?? null
}

/**
 * Validates Bearer token and confirms user is a company admin.
 * Returns the user row (with company_id, is_company_admin) or null.
 */
export async function getCompanyAdmin(request) {
  const header = request.headers.get('authorization') ?? ''
  const token  = header.startsWith('Bearer ') ? header.slice(7).trim() : null
  if (!token) return null

  await sql`ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS is_company_admin BOOLEAN NOT NULL DEFAULT FALSE`

  const rows = await sql`
    SELECT u.*,
           ep.company_id, ep.team, ep.role, ep.is_company_admin,
           c.name AS company_name,
           s.expires_at AS session_expires
    FROM   sessions s
    JOIN   users             u  ON u.id  = s.user_id
    JOIN   employee_profiles ep ON ep.user_id = u.id
    JOIN   companies         c  ON c.id = ep.company_id
    WHERE  s.token = ${token}
      AND  s.expires_at > NOW()
      AND  ep.is_company_admin = TRUE
    LIMIT  1
  `
  return rows[0] ?? null
}
