/**
 * GET /api/questions/field?categoryId=xxx&count=15
 * Returns `count` randomly-shuffled questions from the given category.
 */
import { sql, jsonResponse, handleOptions } from '../_db.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions()
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405)

  try {
    const url = new URL(request.url)
    const categoryId = url.searchParams.get('categoryId')
    const count = Math.min(parseInt(url.searchParams.get('count') ?? '15', 10), 50)

    if (!categoryId) return jsonResponse({ error: 'categoryId is required' }, 400)

    // Use ORDER BY RANDOM() for a fresh shuffle every session
    const rows = await sql`
      SELECT
        id,
        category_id,
        sub_function,
        mode,
        difficulty,
        title,
        original_prompt,
        options,
        correct_option,
        reward_coins,
        hint,
        max_tokens
      FROM questions
      WHERE category_id = ${categoryId}
      ORDER BY RANDOM()
      LIMIT ${count}
    `

    return jsonResponse({ questions: rows })
  } catch (err) {
    console.error('fetch field questions error:', err)
    return jsonResponse({ error: 'Database error' }, 500)
  }
}
