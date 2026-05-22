/**
 * POST /api/admin/assign
 * Body: { employeeId, categoryId, subFunction?, role? }
 * Deactivates any prior assignment for the employee, then inserts a new one.
 */
import { sql, jsonResponse, handleOptions, isAdmin } from '../_db.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions()
  if (!isAdmin(request)) return jsonResponse({ error: 'Unauthorized' }, 401)
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  try {
    const {
      employeeId, categoryId,
      subFunction = null, role = null,
    } = await request.json()

    if (!employeeId || !categoryId) {
      return jsonResponse({ error: 'employeeId and categoryId are required' }, 400)
    }

    // Deactivate existing assignments for this employee
    await sql`
      UPDATE assignments
      SET active = FALSE
      WHERE employee_id = ${employeeId}
    `

    // Insert new assignment
    const rows = await sql`
      INSERT INTO assignments (employee_id, category_id, sub_function, role)
      VALUES (${employeeId}, ${categoryId}, ${subFunction}, ${role})
      RETURNING id
    `

    return jsonResponse({ success: true, id: rows[0].id })
  } catch (err) {
    console.error('admin assign error:', err)
    return jsonResponse({ error: 'Database error' }, 500)
  }
}
