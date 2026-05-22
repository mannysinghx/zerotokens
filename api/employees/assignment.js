/**
 * GET /api/employees/assignment?userId=xxx
 * Returns the active assignment for an authenticated user, or null.
 * Authorization: Bearer <sessionToken>  OR  ?userId=<uuid> (admin use)
 */
import { sql, jsonResponse, handleOptions } from '../_db.js'
import { getSessionUser } from '../_auth.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions(request)
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  try {
    // Prefer session auth; fall back to explicit userId query param
    let userId
    const sessionUser = await getSessionUser(request)
    if (sessionUser) {
      userId = sessionUser.id
    } else {
      const url = new URL(request.url)
      userId = url.searchParams.get('userId')
    }

    if (!userId) return jsonResponse({ error: 'userId is required' }, 400, request)

    const rows = await sql`
      SELECT
        a.id,
        a.category_id,
        a.sub_function,
        a.role,
        a.assigned_at,
        c.name AS category_name
      FROM assignments a
      JOIN categories c ON c.id = a.category_id
      WHERE a.user_id = ${userId}
        AND a.active  = TRUE
      ORDER BY a.assigned_at DESC
      LIMIT 1
    `

    return jsonResponse({ assignment: rows[0] ?? null }, 200, request)
  } catch (err) {
    console.error('fetch assignment error:', err)
    return jsonResponse({ error: `Database error: ${err.message}` }, 500, request)
  }
}
