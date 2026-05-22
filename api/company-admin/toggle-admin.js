/**
 * POST /api/company-admin/toggle-admin
 * Body: { userId, makeAdmin: boolean }
 *
 * Promote or demote a company employee to/from company admin role.
 * Rules:
 *   - Caller must be a company admin.
 *   - Target must belong to the same company.
 *   - You cannot change your own admin status.
 * Edge runtime.
 */
import { sql, jsonResponse, handleOptions } from '../_db.js'
import { getCompanyAdmin } from '../_auth.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions(request)
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  try {
    const admin = await getCompanyAdmin(request)
    if (!admin) return jsonResponse({ error: 'Unauthorized' }, 401, request)

    const { userId, makeAdmin } = await request.json()
    if (!userId)                        return jsonResponse({ error: 'userId is required' }, 400, request)
    if (typeof makeAdmin !== 'boolean') return jsonResponse({ error: 'makeAdmin (boolean) is required' }, 400, request)

    // Cannot modify your own admin status
    if (String(userId) === String(admin.id)) {
      return jsonResponse({ error: 'You cannot change your own admin status' }, 400, request)
    }

    // Target must belong to same company
    const check = await sql`
      SELECT user_id FROM employee_profiles
      WHERE  user_id = ${userId} AND company_id = ${admin.company_id}
      LIMIT  1
    `
    if (check.length === 0) return jsonResponse({ error: 'Employee not found in your company' }, 403, request)

    await sql`
      UPDATE employee_profiles
      SET    is_company_admin = ${makeAdmin}
      WHERE  user_id = ${userId}
    `

    return jsonResponse({ ok: true, isAdmin: makeAdmin }, 200, request)
  } catch (err) {
    console.error('toggle-admin error:', err)
    return jsonResponse({ error: err.message }, 500, request)
  }
}
