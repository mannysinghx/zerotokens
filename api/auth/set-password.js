/**
 * POST /api/auth/set-password
 * Sets password for a user who just verified their email.
 * Body: { token (verification token), password }
 * Returns: { user, sessionToken } — auto-logs in the user.
 */
import { sql, jsonResponse, handleOptions } from '../_db.js'
import { generateSalt, hashPassword, createSession } from '../_auth.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions(request)
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  try {
    const { token, password } = await request.json()
    if (!token)           return jsonResponse({ error: 'Token is required' }, 400, request)
    if (!password)        return jsonResponse({ error: 'Password is required' }, 400, request)
    if (password.length < 8) return jsonResponse({ error: 'Password must be at least 8 characters' }, 400, request)

    // Find the verification record — check used/expired in JS for clear error messages
    const rows = await sql`
      SELECT ev.id, ev.user_id, ev.used, ev.expires_at,
             u.id AS uid, u.email, u.username, u.user_type,
             ep.company_id
      FROM   email_verifications ev
      JOIN   users u ON u.id = ev.user_id
      LEFT JOIN employee_profiles ep ON ep.user_id = u.id
      WHERE  ev.token = ${token}
      LIMIT  1
    `

    if (rows.length === 0) {
      console.error('set-password: token not found in DB:', token?.slice(0, 8) + '...')
      return jsonResponse({ error: 'Invitation link not found. Please request a new invitation.' }, 400, request)
    }

    const row = rows[0]

    if (row.used) {
      console.error('set-password: token already used for user:', row.uid)
      return jsonResponse({ error: 'This link has already been used. Log in with your email and password, or ask your admin to send a new invitation.' }, 400, request)
    }

    if (new Date(row.expires_at) < new Date()) {
      console.error('set-password: token expired at:', row.expires_at)
      return jsonResponse({ error: 'This invitation link has expired. Please ask your admin to send a new invitation.' }, 400, request)
    }

    const salt = generateSalt()
    const hash = await hashPassword(password, salt)

    // Set password + mark verified + mark token used
    await sql`
      UPDATE users
      SET password_hash = ${hash}, password_salt = ${salt},
          email_verified = TRUE, updated_at = NOW()
      WHERE id = ${row.uid}
    `
    await sql`UPDATE email_verifications SET used = TRUE WHERE id = ${row.id}`

    // Create session → auto-login
    const sessionToken = await createSession(row.uid)

    // Fetch full user (with company name)
    const userRows = await sql`
      SELECT u.*,
             ep.company_id, ep.team, ep.role, ep.is_company_admin,
             c.name AS company_name
      FROM   users u
      LEFT JOIN employee_profiles ep ON ep.user_id = u.id
      LEFT JOIN companies         c  ON c.id       = ep.company_id
      WHERE  u.id = ${row.uid}
      LIMIT  1
    `
    const { password_hash, password_salt, ...safeUser } = userRows[0]

    return jsonResponse({ user: safeUser, sessionToken }, 200, request)
  } catch (err) {
    console.error('set-password error:', err)
    return jsonResponse({ error: `Failed to set password: ${err.message}` }, 500, request)
  }
}
