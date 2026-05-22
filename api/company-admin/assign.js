/**
 * POST /api/company-admin/assign
 * Body: { userId, categoryId, subFunction?, role? }
 *
 * Company-scoped course assignment. Verifies the target user belongs to the
 * same company as the authenticated admin before assigning.
 *
 * Edge runtime — uses Neon HTTP driver.
 */
import { sql, jsonResponse, handleOptions } from '../_db.js'
import { getCompanyAdmin } from '../_auth.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions(request)
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  const admin = await getCompanyAdmin(request)
  if (!admin) return jsonResponse({ error: 'Unauthorized' }, 401, request)

  try {
    const { userId, categoryId, subFunction = null, role = null } = await request.json()

    if (!userId)     return jsonResponse({ error: 'userId is required' },     400, request)
    if (!categoryId) return jsonResponse({ error: 'categoryId is required' }, 400, request)

    // Verify target user belongs to this admin's company
    const check = await sql`
      SELECT user_id FROM employee_profiles
      WHERE user_id = ${userId} AND company_id = ${admin.company_id}
      LIMIT 1
    `
    if (check.length === 0) {
      return jsonResponse({ error: 'Employee not found in your company' }, 403, request)
    }

    // Deactivate existing assignments for this user
    await sql`UPDATE assignments SET active = FALSE WHERE user_id = ${userId}`

    // Insert new active assignment
    const rows = await sql`
      INSERT INTO assignments (user_id, category_id, sub_function, role)
      VALUES (${userId}, ${categoryId}, ${subFunction}, ${role})
      RETURNING id
    `

    return jsonResponse({ success: true, id: rows[0].id }, 200, request)
  } catch (err) {
    console.error('company-admin assign error:', err)
    return jsonResponse({ error: `Database error: ${err.message}` }, 500, request)
  }
}
