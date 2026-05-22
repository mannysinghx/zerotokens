/**
 * PATCH /api/company-admin/update-employee
 * Body: { userId, username?, email? }
 *
 * Update a company employee's username and/or email.
 * Target must belong to the same company as the admin.
 * Edge runtime.
 */
import { sql, jsonResponse, handleOptions } from '../_db.js'
import { getCompanyAdmin } from '../_auth.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions(request)
  if (request.method !== 'PATCH') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  try {
    const admin = await getCompanyAdmin(request)
    if (!admin) return jsonResponse({ error: 'Unauthorized' }, 401, request)

    const { userId, username, email } = await request.json()
    if (!userId)                          return jsonResponse({ error: 'userId is required' }, 400, request)
    if (!username?.trim() && !email?.trim()) return jsonResponse({ error: 'Nothing to update' }, 400, request)

    // Verify target belongs to admin's company
    const check = await sql`
      SELECT user_id FROM employee_profiles
      WHERE  user_id = ${userId} AND company_id = ${admin.company_id}
      LIMIT 1
    `
    if (check.length === 0) return jsonResponse({ error: 'Employee not found in your company' }, 403, request)

    // Duplicate email check
    if (email?.trim()) {
      const emailLower = email.trim().toLowerCase()
      const dup = await sql`SELECT id FROM users WHERE email = ${emailLower} AND id != ${userId} LIMIT 1`
      if (dup.length > 0) return jsonResponse({ error: 'That email is already in use by another account' }, 409, request)
    }

    // Apply updates
    if (username?.trim() && email?.trim()) {
      const emailLower = email.trim().toLowerCase()
      await sql`UPDATE users SET username = ${username.trim()}, email = ${emailLower}, updated_at = NOW() WHERE id = ${userId}`
    } else if (username?.trim()) {
      await sql`UPDATE users SET username = ${username.trim()}, updated_at = NOW() WHERE id = ${userId}`
    } else {
      const emailLower = email.trim().toLowerCase()
      await sql`UPDATE users SET email = ${emailLower}, updated_at = NOW() WHERE id = ${userId}`
    }

    return jsonResponse({ ok: true }, 200, request)
  } catch (err) {
    console.error('update-employee error:', err)
    return jsonResponse({ error: err.message }, 500, request)
  }
}
