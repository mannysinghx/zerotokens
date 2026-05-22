/**
 * GET /api/admin/employees
 * Returns company employees only (user_type = 'company') with their
 * company profile, latest assignment, and company name.
 * Individual learners are excluded — use /api/admin/individuals for those.
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
        ep.team,
        ep.role        AS profile_role,
        c.name         AS company_name,
        c.id           AS company_id,
        a.category_id,
        a.sub_function,
        a.role         AS assigned_role,
        a.assigned_at,
        cat.name       AS category_name_assigned
      FROM   users u
      INNER JOIN employee_profiles ep ON ep.user_id = u.id
      INNER JOIN companies         c  ON c.id       = ep.company_id
      LEFT  JOIN LATERAL (
        SELECT * FROM assignments
        WHERE  user_id = u.id AND active = TRUE
        ORDER  BY assigned_at DESC
        LIMIT  1
      ) a ON TRUE
      LEFT JOIN categories cat ON cat.id = a.category_id
      WHERE  u.user_type = 'company'
      ORDER  BY c.name ASC, u.created_at DESC
    `

    return jsonResponse({ employees: rows }, 200, request)
  } catch (err) {
    console.error('admin employees error:', err)
    return jsonResponse({ error: `Database error: ${err.message}` }, 500, request)
  }
}
