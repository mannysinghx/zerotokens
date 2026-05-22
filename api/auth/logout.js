/**
 * POST /api/auth/logout
 * Invalidates the current session token.
 * Authorization: Bearer <token>
 */
import { sql, jsonResponse, handleOptions } from '../_db.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions(request)
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  try {
    const header = request.headers.get('authorization') ?? ''
    const token  = header.startsWith('Bearer ') ? header.slice(7).trim() : null

    if (token) {
      await sql`DELETE FROM sessions WHERE token = ${token}`
    }

    return jsonResponse({ success: true }, 200, request)
  } catch (err) {
    console.error('logout error:', err)
    return jsonResponse({ error: 'Logout failed' }, 500, request)
  }
}
