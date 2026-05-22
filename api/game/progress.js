/**
 * POST /api/game/progress
 * Body: { gameState: object }
 * Saves the full game state JSON to the authenticated user's DB record.
 * Authorization: Bearer <sessionToken>
 */
import { sql, jsonResponse, handleOptions } from '../_db.js'
import { getSessionUser } from '../_auth.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions(request)
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  try {
    const user = await getSessionUser(request)
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, request)

    const { gameState } = await request.json()
    if (!gameState || typeof gameState !== 'object') {
      return jsonResponse({ error: 'gameState must be an object' }, 400, request)
    }

    await sql`
      UPDATE users
      SET game_state = ${JSON.stringify(gameState)}::jsonb,
          updated_at = NOW()
      WHERE id = ${user.id}
    `

    return jsonResponse({ success: true }, 200, request)
  } catch (err) {
    console.error('progress save error:', err)
    return jsonResponse({ error: `Failed to save progress: ${err.message}` }, 500, request)
  }
}
