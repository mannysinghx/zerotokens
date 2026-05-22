/**
 * GET /api/admin/stats
 * Returns dashboard stats: total users, assignments, responses today,
 * avg score, and per-category breakdown.
 */
import { sql, jsonResponse, handleOptions, isAdmin } from '../_db.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions(request)
  if (!isAdmin(request)) return jsonResponse({ error: 'Unauthorized' }, 401, request)
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  try {
    const [totals, responsesToday, categoryStats] = await Promise.all([
      sql`
        SELECT
          (SELECT COUNT(*) FROM users)::int                             AS total_employees,
          (SELECT COUNT(*) FROM assignments WHERE active = TRUE)::int   AS active_assignments,
          (SELECT COUNT(*) FROM responses)::int                         AS total_responses,
          (SELECT ROUND(AVG(total_score)) FROM responses
           WHERE total_score IS NOT NULL)::int                          AS avg_score
      `,
      sql`
        SELECT COUNT(*)::int AS count
        FROM responses
        WHERE answered_at >= NOW() - INTERVAL '24 hours'
      `,
      sql`
        SELECT
          c.id,
          c.name,
          COUNT(DISTINCT q.id)::int             AS question_count,
          COUNT(DISTINCT r.user_id)::int        AS unique_learners,
          COUNT(r.id)::int                      AS response_count,
          ROUND(AVG(r.total_score))::int        AS avg_score
        FROM categories c
        LEFT JOIN questions q  ON q.category_id = c.id
        LEFT JOIN responses r  ON r.category_id = c.id
        GROUP BY c.id, c.name
        ORDER BY c.name
      `,
    ])

    return jsonResponse({
      totals:         totals[0],
      responsesToday: responsesToday[0].count,
      categoryStats,
    }, 200, request)
  } catch (err) {
    console.error('admin stats error:', err)
    const msg = err?.message ?? 'Unknown error'
    const isTableMissing = msg.includes('does not exist') || msg.includes('relation')
    return jsonResponse({
      error: isTableMissing
        ? 'Database tables not found. Run db/migration_002_auth.sql in your Neon dashboard first.'
        : `Database error: ${msg}`,
    }, 500, request)
  }
}
