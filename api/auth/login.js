/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { user, sessionToken }
 */
import { sql, jsonResponse, handleOptions } from '../_db.js'
import { verifyPassword, createSession } from '../_auth.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions(request)
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  try {
    const { email, password } = await request.json()
    if (!email || !password) return jsonResponse({ error: 'Email and password are required' }, 400, request)

    const emailLower = email.trim().toLowerCase()

    // Ensure is_company_admin column exists (idempotent no-op after first run)
    await sql`ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS is_company_admin BOOLEAN NOT NULL DEFAULT FALSE`

    const rows = await sql`
      SELECT u.*,
             ep.company_id, ep.team, ep.role, ep.is_company_admin,
             c.name AS company_name
      FROM   users u
      LEFT JOIN employee_profiles ep ON ep.user_id = u.id
      LEFT JOIN companies         c  ON c.id       = ep.company_id
      WHERE  u.email = ${emailLower}
      LIMIT  1
    `
    const user = rows[0]

    if (!user) {
      return jsonResponse({ error: 'No account found with that email.' }, 401, request)
    }

    if (!user.email_verified) {
      return jsonResponse({ error: 'Please verify your email first. Check your inbox for the invitation link.' }, 403, request)
    }

    if (!user.password_hash || !user.password_salt) {
      return jsonResponse({ error: 'Password not set. Use the invitation link from your email.' }, 403, request)
    }

    const valid = await verifyPassword(password, user.password_salt, user.password_hash)
    if (!valid) {
      return jsonResponse({ error: 'Incorrect password.' }, 401, request)
    }

    const token = await createSession(user.id)

    // Return safe user object (no password fields)
    const { password_hash, password_salt, ...safeUser } = user

    return jsonResponse({ user: safeUser, sessionToken: token }, 200, request)
  } catch (err) {
    console.error('login error:', err)
    return jsonResponse({ error: `Login failed: ${err.message}` }, 500, request)
  }
}
