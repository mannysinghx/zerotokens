/**
 * GET /api/company-admin/employees
 * Returns all employees for the authenticated company admin's company.
 * Excludes the admin themselves.
 * Edge runtime.
 */
import { sql, jsonResponse, handleOptions } from '../_db.js'
import { getCompanyAdmin } from '../_auth.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions(request)
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  try {
    // Idempotent migrations
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE`
    await sql`ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS is_company_admin BOOLEAN NOT NULL DEFAULT FALSE`

    const admin = await getCompanyAdmin(request)
    if (!admin) return jsonResponse({ error: 'Unauthorized — company admin access required' }, 401, request)

    const rows = await sql`
      SELECT
        u.id,
        u.email,
        u.username,
        u.email_verified,
        u.is_active,
        u.created_at,
        ep.team,
        ep.role        AS profile_role,
        ep.is_company_admin,
        c.name         AS company_name,
        c.id           AS company_id,
        a.category_id,
        a.sub_function,
        a.role         AS assigned_role,
        a.assigned_at,
        cat.name       AS category_name_assigned
      FROM   users u
      INNER JOIN employee_profiles ep ON ep.user_id    = u.id
      INNER JOIN companies         c  ON c.id          = ep.company_id
      LEFT  JOIN LATERAL (
        SELECT * FROM assignments
        WHERE  user_id = u.id AND active = TRUE
        ORDER  BY assigned_at DESC
        LIMIT  1
      ) a ON TRUE
      LEFT JOIN categories cat ON cat.id = a.category_id
      WHERE  u.user_type = 'company'
        AND  ep.company_id = ${admin.company_id}
        AND  u.id != ${admin.id}
      ORDER  BY u.created_at DESC
    `

    return jsonResponse({ employees: rows }, 200, request)
  } catch (err) {
    console.error('company-admin/employees error:', err)
    return jsonResponse({ error: `Database error: ${err.message}` }, 500, request)
  }
}
