/**
 * GET /api/admin/individuals
 * Returns individual self-registered learners only (user_type = 'individual').
 * Company employees are excluded — use /api/admin/employees for those.
 * Requires x-admin-password header.
 */
import { sql, jsonResponse, handleOptions, isAdmin } from '../_db.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions(request)
  if (!isAdmin(request)) return jsonResponse({ error: 'Unauthorized' }, 401, request)
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  try {
    const rows = await sql`
      SELECT
        u.id,
        u.email,
        u.username,
        u.email_verified,
        u.created_at,
        (SELECT COUNT(*)::int FROM responses WHERE user_id = u.id) AS response_count,
        (SELECT MAX(answered_at) FROM responses WHERE user_id = u.id) AS last_active
      FROM   users u
      WHERE  u.user_type = 'individual'
      ORDER  BY u.created_at DESC
    `

    return jsonResponse({ individuals: rows }, 200, request)
  } catch (err) {
    console.error('admin individuals error:', err)
    return jsonResponse({ error: `Database error: ${err.message}` }, 500, request)
  }
}
