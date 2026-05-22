/**
 * GET /api/auth/me
 * Returns current user + game_state from the session token.
 * Authorization: Bearer <token>
 */
import { jsonResponse, handleOptions } from '../_db.js'
import { getSessionUser } from '../_auth.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions(request)
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  try {
    const user = await getSessionUser(request)
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, request)

    const { password_hash, password_salt, ...safeUser } = user
    return jsonResponse({ user: safeUser }, 200, request)
  } catch (err) {
    console.error('me error:', err)
    return jsonResponse({ error: `Session error: ${err.message}` }, 500, request)
  }
}
