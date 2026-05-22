/**
 * POST /api/auth/verify-email
 * Body: { token }
 * Validates the verification token.
 * - If password not yet set (company invite): returns { needsPassword: true }
 * - If password already set (individual signup): creates a session and returns
 *   { needsPassword: false, user, sessionToken } — auto-logs the user in.
 */
import { sql, jsonResponse, handleOptions } from '../_db.js'
import { createSession } from '../_auth.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions(request)
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  try {
    const { token } = await request.json()
    if (!token) return jsonResponse({ error: 'Token is required' }, 400, request)

    const rows = await sql`
      SELECT ev.*, u.email, u.username, u.password_hash, u.email_verified
      FROM   email_verifications ev
      JOIN   users u ON u.id = ev.user_id
      WHERE  ev.token = ${token}
        AND  ev.expires_at > NOW()
        AND  ev.used = FALSE
      LIMIT  1
    `

    if (rows.length === 0) {
      return jsonResponse({
        error: 'This verification link is invalid or has expired. Please sign up again or request a new invitation.',
      }, 400, request)
    }

    const verification = rows[0]

    // Mark email as verified
    await sql`
      UPDATE users SET email_verified = TRUE, updated_at = NOW()
      WHERE id = ${verification.user_id}
    `

    // Password already set = individual self-signup. Mark token used, create session, auto-login.
    if (verification.password_hash) {
      await sql`UPDATE email_verifications SET used = TRUE WHERE id = ${verification.id}`
      const sessionToken = await createSession(verification.user_id)
      const userRows = await sql`
        SELECT u.*,
               ep.company_id, ep.team, ep.role,
               c.name AS company_name
        FROM   users u
        LEFT JOIN employee_profiles ep ON ep.user_id = u.id
        LEFT JOIN companies         c  ON c.id       = ep.company_id
        WHERE  u.id = ${verification.user_id}
        LIMIT  1
      `
      const { password_hash, password_salt, ...safeUser } = userRows[0]
      return jsonResponse({ needsPassword: false, user: safeUser, sessionToken }, 200, request)
    }

    // No password yet = company invite. Keep token valid until set-password is called.
    return jsonResponse({
      needsPassword: true,
      email:         verification.email,
      username:      verification.username,
    }, 200, request)
  } catch (err) {
    console.error('verify-email error:', err)
    return jsonResponse({ error: `Verification failed: ${err.message}` }, 500, request)
  }
}
