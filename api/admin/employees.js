/**
 * GET /api/admin/employees
 * Returns all employees with their latest assignment.
 * Requires x-admin-password header.
 */
import { sql, jsonResponse, handleOptions, isAdmin } from '../_db.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions()
  if (!isAdmin(request)) return jsonResponse({ error: 'Unauthorized' }, 401)
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405)

  try {
    const rows = await sql`
      SELECT
        e.id,
        e.username,
        e.team,
        e.company,
        e.created_at,
        a.category_id,
        a.sub_function,
        a.role,
        a.assigned_at,
        c.name AS category_name
      FROM employees e
      LEFT JOIN LATERAL (
        SELECT * FROM assignments
        WHERE employee_id = e.id AND active = TRUE
        ORDER BY assigned_at DESC
        LIMIT 1
      ) a ON TRUE
      LEFT JOIN categories c ON c.id = a.category_id
      ORDER BY e.created_at DESC
    `

    return jsonResponse({ employees: rows })
  } catch (err) {
    console.error('admin employees error:', err)
    return jsonResponse({ error: 'Database error' }, 500)
  }
}
