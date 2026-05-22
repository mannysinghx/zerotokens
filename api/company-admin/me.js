/**
 * GET /api/company-admin/me
 * Validates Bearer token and confirms company admin status.
 * Returns { user } with company info, or 401 if not a company admin.
 * Edge runtime.
 */
import { jsonResponse, handleOptions } from '../_db.js'
import { getCompanyAdmin } from '../_auth.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions(request)
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  try {
    const admin = await getCompanyAdmin(request)
    if (!admin) return jsonResponse({ error: 'Unauthorized — company admin access required' }, 401, request)

    return jsonResponse({ user: admin }, 200, request)
  } catch (err) {
    console.error('company-admin/me error:', err)
    return jsonResponse({ error: err.message }, 500, request)
  }
}
