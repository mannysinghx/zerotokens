/**
 * PATCH /api/company-admin/user-manage
 * Body: { userId, action, newPassword? }
 * Actions: 'disable' | 'enable' | 'delete' | 'set-password'
 *
 * Company admin can only manage users in their own company.
 * Promote/demote is reserved for super admin only.
 * Edge runtime.
 */
import { sql, jsonResponse, handleOptions } from '../_db.js'
import { getCompanyAdmin, generateSalt, hashPassword } from '../_auth.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions(request)
  if (request.method !== 'PATCH') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  try {
    const admin = await getCompanyAdmin(request)
    if (!admin) return jsonResponse({ error: 'Unauthorized — company admin access required' }, 401, request)

    const { userId, action, newPassword } = await request.json()

    if (!userId) return jsonResponse({ error: 'userId is required' }, 400, request)
    if (!action) return jsonResponse({ error: 'action is required' }, 400, request)

    // Ensure is_active column exists
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE`

    // Verify target user belongs to the same company
    const targetRows = await sql`
      SELECT ep.user_id
      FROM   employee_profiles ep
      WHERE  ep.user_id    = ${userId}
        AND  ep.company_id = ${admin.company_id}
      LIMIT  1
    `
    if (targetRows.length === 0) {
      return jsonResponse({ error: 'Forbidden — user not in your company' }, 403, request)
    }

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
      await sql`DELETE FROM sessions WHERE user_id = ${userId}`
      return jsonResponse({ ok: true }, 200, request)
    }

    return jsonResponse({ error: `Unknown action: ${action}` }, 400, request)

  } catch (err) {
    console.error('company-admin/user-manage error:', err)
    return jsonResponse({ error: err.message }, 500, request)
  }
}
