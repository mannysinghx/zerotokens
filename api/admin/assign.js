/**
 * POST /api/admin/assign
 * Body: { userId, categoryId, subFunction?, role? }
 * Deactivates any prior assignment for the user, then inserts a new one.
 * Requires x-admin-password header.
 */
import { sql, jsonResponse, handleOptions, isAdmin } from '../_db.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions(request)
  if (!isAdmin(request)) return jsonResponse({ error: 'Unauthorized' }, 401, request)
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  try {
    const {
      userId, categoryId,
      subFunction = null, role = null,
    } = await request.json()

    if (!userId || !categoryId) {
      return jsonResponse({ error: 'userId and categoryId are required' }, 400, request)
    }

    // Deactivate existing assignments for this user
    await sql`
      UPDATE assignments SET active = FALSE
      WHERE user_id = ${userId}
    `

    // Insert new active assignment
    const rows = await sql`
      INSERT INTO assignments (user_id, category_id, sub_function, role)
      VALUES (${userId}, ${categoryId}, ${subFunction}, ${role})
      RETURNING id
    `

    return jsonResponse({ success: true, id: rows[0].id }, 200, request)
  } catch (err) {
    console.error('admin assign error:', err)
    return jsonResponse({ error: `Database error: ${err.message}` }, 500, request)
  }
}
