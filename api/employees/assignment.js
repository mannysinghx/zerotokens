/**
 * GET /api/employees/assignment?employeeId=xxx
 * Returns the active assignment for an employee, or null.
 */
import { sql, jsonResponse, handleOptions } from '../_db.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions()
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405)

  try {
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')

    if (!employeeId) return jsonResponse({ error: 'employeeId is required' }, 400)

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
      WHERE a.employee_id = ${employeeId}
        AND a.active = TRUE
      ORDER BY a.assigned_at DESC
      LIMIT 1
    `

    return jsonResponse({ assignment: rows[0] ?? null })
  } catch (err) {
    console.error('fetch assignment error:', err)
    return jsonResponse({ error: 'Database error' }, 500)
  }
}
