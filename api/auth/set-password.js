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

    // Find the verification record
    const rows = await sql`
      SELECT ev.*, u.id AS uid, u.email, u.username, u.user_type,
             ep.company_id
      FROM   email_verifications ev
      JOIN   users u ON u.id = ev.user_id
      LEFT JOIN employee_profiles ep ON ep.user_id = u.id
      WHERE  ev.token = ${token}
        AND  ev.used  = FALSE
      LIMIT  1
    `

    if (rows.length === 0) {
      return jsonResponse({ error: 'Invalid or expired token. Please request a new invitation.' }, 400, request)
    }

    const v    = rows[0]
    const salt = generateSalt()
    const hash = await hashPassword(password, salt)

    // Set password + mark verified + mark token used
    await sql`
      UPDATE users
      SET password_hash = ${hash}, password_salt = ${salt},
          email_verified = TRUE, updated_at = NOW()
      WHERE id = ${v.uid}
    `
    await sql`UPDATE email_verifications SET used = TRUE WHERE id = ${v.id}`

    // Create session → auto-login
    const sessionToken = await createSession(v.uid)

    // Fetch full user (with company name)
    const userRows = await sql`
      SELECT u.*,
             ep.company_id, ep.team, ep.role,
             c.name AS company_name
      FROM   users u
      LEFT JOIN employee_profiles ep ON ep.user_id = u.id
      LEFT JOIN companies         c  ON c.id       = ep.company_id
      WHERE  u.id = ${v.uid}
      LIMIT  1
    `
    const { password_hash, password_salt, ...safeUser } = userRows[0]

    return jsonResponse({ user: safeUser, sessionToken }, 200, request)
  } catch (err) {
    console.error('set-password error:', err)
    return jsonResponse({ error: `Failed to set password: ${err.message}` }, 500, request)
  }
}
