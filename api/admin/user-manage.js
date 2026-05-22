/**
 * PATCH /api/admin/user-manage
 * Body: { userId, action, newPassword? }
 * Actions: 'disable' | 'enable' | 'delete' | 'set-password'
 *
 * Disable  — sets is_active = FALSE, kills all sessions
 * Enable   — sets is_active = TRUE
 * Delete   — removes user row (cascades to sessions/responses/assignments)
 * Set-pass — re-hashes password, kills all sessions to force re-login
 *
 * Requires x-admin-password header.
 * Edge runtime — uses Neon HTTP driver + Web Crypto for hashing.
 */
import { sql, jsonResponse, handleOptions, isAdmin } from '../_db.js'
import { generateSalt, hashPassword } from '../_auth.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions(request)
  if (!isAdmin(request))            return jsonResponse({ error: 'Unauthorized' }, 401, request)
  if (request.method !== 'PATCH')   return jsonResponse({ error: 'Method not allowed' }, 405, request)

  try {
    const { userId, action, newPassword } = await request.json()

    if (!userId) return jsonResponse({ error: 'userId is required' }, 400, request)
    if (!action) return jsonResponse({ error: 'action is required' }, 400, request)

    // Ensure is_active column exists (idempotent — fast no-op after first run)
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE`

    // ── disable ──────────────────────────────────────────────────────────────
    if (action === 'disable') {
      await sql`UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = ${userId}`
      await sql`DELETE FROM sessions WHERE user_id = ${userId}`
      return jsonResponse({ ok: true }, 200, request)
    }

    // ── enable ───────────────────────────────────────────────────────────────
    if (action === 'enable') {
      await sql`UPDATE users SET is_active = TRUE, updated_at = NOW() WHERE id = ${userId}`
      return jsonResponse({ ok: true }, 200, request)
    }

    // ── delete ───────────────────────────────────────────────────────────────
    if (action === 'delete') {
      // ON DELETE CASCADE handles sessions, email_verifications,
      // assignments, responses, employee_profiles
      await sql`DELETE FROM users WHERE id = ${userId}`
      return jsonResponse({ ok: true }, 200, request)
    }

    // ── set-password ─────────────────────────────────────────────────────────
    if (action === 'set-password') {
      if (!newPassword || newPassword.length < 8)
        return jsonResponse({ error: 'Password must be at least 8 characters' }, 400, request)

      const salt = generateSalt()
      const hash = await hashPassword(newPassword, salt)

      await sql`
        UPDATE users
        SET    password_hash = ${hash},
               password_salt = ${salt},
               updated_at    = NOW()
        WHERE  id = ${userId}
      `
      // Force re-login on all devices
      await sql`DELETE FROM sessions WHERE user_id = ${userId}`
      return jsonResponse({ ok: true }, 200, request)
    }

    return jsonResponse({ error: `Unknown action: ${action}` }, 400, request)

  } catch (err) {
    console.error('user-manage error:', err)
    return jsonResponse({ error: err.message }, 500, request)
  }
}
