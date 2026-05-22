/**
 * POST /api/auth/verify-email
 * Body: { token }
 * Validates the verification token.
 * Returns: { needsPassword: true } if password not yet set, else { needsPassword: false }
 */
import { sql, jsonResponse, handleOptions } from '../_db.js'

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
        error: 'This verification link is invalid or has expired. Ask your admin to resend the invitation.',
      }, 400, request)
    }

    const verification = rows[0]

    // Mark email as verified
    await sql`
      UPDATE users SET email_verified = TRUE, updated_at = NOW()
      WHERE id = ${verification.user_id}
    `

    // If password already set (e.g. re-verifying), just confirm
    if (verification.password_hash) {
      // Mark token used
      await sql`UPDATE email_verifications SET used = TRUE WHERE id = ${verification.id}`
      return jsonResponse({ needsPassword: false, email: verification.email }, 200, request)
    }

    // Password still needed — keep token valid until set-password is called
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
