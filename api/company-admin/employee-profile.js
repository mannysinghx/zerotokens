/**
 * GET /api/company-admin/employee-profile?userId=...
 *
 * Returns a full profile for a specific employee:
 *   - user info + profile flags
 *   - active course assignment
 *   - activity stats (totals, averages, grade distribution)
 *   - last 10 responses
 *
 * Target must belong to the same company as the authenticated admin.
 * Edge runtime.
 */
import { sql, jsonResponse, handleOptions } from '../_db.js'
import { getCompanyAdmin } from '../_auth.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions(request)
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  try {
    const admin = await getCompanyAdmin(request)
    if (!admin) return jsonResponse({ error: 'Unauthorized' }, 401, request)

    const url    = new URL(request.url)
    const userId = url.searchParams.get('userId')
    if (!userId) return jsonResponse({ error: 'userId is required' }, 400, request)

    // ── User + profile ────────────────────────────────────────────────────────
    const userRows = await sql`
      SELECT
        u.id, u.email, u.username, u.email_verified, u.is_active,
        u.created_at, u.updated_at,
        ep.team, ep.role AS profile_role, ep.is_company_admin
      FROM   users u
      JOIN   employee_profiles ep ON ep.user_id = u.id
      WHERE  u.id = ${userId}
        AND  ep.company_id = ${admin.company_id}
      LIMIT  1
    `
    if (userRows.length === 0) {
      return jsonResponse({ error: 'Employee not found in your company' }, 404, request)
    }
    const user = userRows[0]

    // ── Active assignment ─────────────────────────────────────────────────────
    const assignRows = await sql`
      SELECT category_id, sub_function, role, assigned_at
      FROM   assignments
      WHERE  user_id = ${userId} AND active = TRUE
      ORDER  BY assigned_at DESC
      LIMIT  1
    `

    // ── Activity stats ────────────────────────────────────────────────────────
    const statsRows = await sql`
      SELECT
        COUNT(*)::int                                  AS total_answered,
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::int AS total_correct,
        ROUND(AVG(total_score)::numeric, 1)            AS avg_score,
        ROUND(AVG(tokens_saved)::numeric, 1)           AS avg_tokens_saved,
        MAX(answered_at)                               AS last_active
      FROM responses
      WHERE user_id = ${userId}
    `

    // Grade distribution
    const gradeRows = await sql`
      SELECT grade, COUNT(*)::int AS count
      FROM   responses
      WHERE  user_id = ${userId} AND grade IS NOT NULL
      GROUP  BY grade
      ORDER  BY grade
    `

    // ── Recent responses ──────────────────────────────────────────────────────
    const recentRows = await sql`
      SELECT
        r.is_correct, r.total_score, r.grade, r.tokens_saved, r.answered_at,
        r.category_id,
        q.title AS question_title
      FROM   responses r
      LEFT JOIN questions q ON q.id = r.question_id
      WHERE  r.user_id = ${userId}
      ORDER  BY r.answered_at DESC
      LIMIT  10
    `

    const rawStats = statsRows[0] ?? {}
    const stats = {
      total_answered:  rawStats.total_answered  ?? 0,
      total_correct:   rawStats.total_correct   ?? 0,
      avg_score:       rawStats.avg_score       ?? null,
      avg_tokens_saved: rawStats.avg_tokens_saved ?? null,
      last_active:     rawStats.last_active     ?? null,
      grades: Object.fromEntries(gradeRows.map(g => [g.grade, g.count])),
    }

    return jsonResponse({
      user,
      assignment:       assignRows[0] ?? null,
      stats,
      recent_responses: recentRows,
    }, 200, request)
  } catch (err) {
    console.error('employee-profile error:', err)
    return jsonResponse({ error: err.message }, 500, request)
  }
}
