/**
 * GET  /api/admin/companies        — list all companies
 * POST /api/admin/companies        — create a company
 */
import { sql, jsonResponse, handleOptions, isAdmin } from '../_db.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions(request)
  if (!isAdmin(request)) return jsonResponse({ error: 'Unauthorized' }, 401, request)

  if (request.method === 'GET') {
    try {
      const rows = await sql`
        SELECT
          c.*,
          COUNT(DISTINCT ep.user_id)::int    AS employee_count,
          COUNT(DISTINCT r.id)::int          AS response_count
        FROM companies c
        LEFT JOIN employee_profiles ep ON ep.company_id = c.id
        LEFT JOIN responses r ON r.user_id = ep.user_id
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `
      return jsonResponse({ companies: rows }, 200, request)
    } catch (err) {
      return jsonResponse({ error: `Database error: ${err.message}` }, 500, request)
    }
  }

  if (request.method === 'POST') {
    try {
      const { name, domain } = await request.json()
      if (!name?.trim()) return jsonResponse({ error: 'Company name is required' }, 400, request)

      const rows = await sql`
        INSERT INTO companies (name, domain)
        VALUES (${name.trim()}, ${domain?.trim() ?? null})
        RETURNING *
      `
      return jsonResponse({ company: rows[0] }, 201, request)
    } catch (err) {
      return jsonResponse({ error: `Database error: ${err.message}` }, 500, request)
    }
  }

  return jsonResponse({ error: 'Method not allowed' }, 405, request)
}
