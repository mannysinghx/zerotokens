/**
 * POST /api/employees/upsert
 * Legacy endpoint — now a no-op.
 * Employee sync is handled via proper auth (POST /api/auth/register or admin invite).
 */
import { jsonResponse, handleOptions } from '../_db.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions(request)
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  // Gracefully accept calls from old clients without doing anything
  return jsonResponse({ success: true, note: 'Use /api/auth/register for new accounts' }, 200, request)
}
