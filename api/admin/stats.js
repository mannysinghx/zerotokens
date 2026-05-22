/**
 * GET /api/admin/stats
 * Returns dashboard stats: total employees, assignments, responses today,
 * avg score, and per-category breakdown.
 */
import { sql, jsonResponse, handleOptions, isAdmin } from '../_db.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions(request)
  if (!isAdmin(request)) return jsonResponse({ error: 'Unauthorized' }, 401)
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405)

  try {
    const [totals, responsesToday, categoryStats] = await Promise.all([
      // Total employees, active assignments, all-time responses
      sql`
        SELECT
          (SELECT COUNT(*) FROM employees)              AS total_employees,
          (SELECT COUNT(*) FROM assignments WHERE active = TRUE) AS active_assignments,
          (SELECT COUNT(*) FROM responses)              AS total_responses,
          (SELECT ROUND(AVG(total_score)) FROM responses WHERE total_score IS NOT NULL) AS avg_score
      `,
      // Responses in last 24h
      sql`
        SELECT COUNT(*) AS count
        FROM responses
        WHERE answered_at >= NOW() - INTERVAL '24 hours'
      `,
      // Per-category: question count, response count, avg score
      sql`
        SELECT
          c.id,
          c.name,
          COUNT(DISTINCT q.id)                         AS question_count,
          COUNT(DISTINCT r.employee_id)                AS unique_learners,
          COUNT(r.id)                                  AS response_count,
          ROUND(AVG(r.total_score))                    AS avg_score
        FROM categories c
        LEFT JOIN questions q  ON q.category_id = c.id
        LEFT JOIN responses r  ON r.category_id = c.id
        GROUP BY c.id, c.name
        ORDER BY c.name
      `,
    ])

    return jsonResponse({
      totals: totals[0],
      responsesToday: responsesToday[0].count,
      categoryStats,
    })
  } catch (err) {
    console.error('admin stats error:', err)
    // Surface the real DB error so it's visible in the admin UI during setup
    const msg = err?.message ?? 'Unknown error'
    const isTableMissing = msg.includes('does not exist') || msg.includes('relation')
    return jsonResponse({
      error: isTableMissing
        ? 'Database tables not found. Run db/schema.sql in your Neon dashboard first.'
        : `Database error: ${msg}`,
    }, 500)
  }
}
