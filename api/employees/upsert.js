/**
 * POST /api/employees/upsert
 * Body: { id, username, team?, company? }
 * Creates or updates the employee row from localStorage data.
 */
import { sql, jsonResponse, handleOptions } from '../_db.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions()
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  try {
    const { id, username, team = null, company = null } = await request.json()

    if (!id || !username) return jsonResponse({ error: 'id and username are required' }, 400)

    await sql`
      INSERT INTO employees (id, username, team, company, updated_at)
      VALUES (${id}, ${username}, ${team}, ${company}, NOW())
      ON CONFLICT (id) DO UPDATE
        SET username   = EXCLUDED.username,
            team       = EXCLUDED.team,
            company    = EXCLUDED.company,
            updated_at = NOW()
    `

    return jsonResponse({ success: true })
  } catch (err) {
    console.error('upsert employee error:', err)
    return jsonResponse({ error: 'Database error' }, 500)
  }
}
