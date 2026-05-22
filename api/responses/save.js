/**
 * POST /api/responses/save
 * Body: { questionId, categoryId, userAnswer, correctAnswer,
 *         isCorrect, totalScore, grade, tokensSaved }
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

    const {
      questionId, categoryId,
      userAnswer    = null,
      correctAnswer = null,
      isCorrect     = false,
      totalScore    = 0,
      grade         = 'D',
      tokensSaved   = 0,
    } = await request.json()

    if (!questionId || !categoryId) {
      return jsonResponse({ error: 'questionId and categoryId are required' }, 400, request)
    }

    const rows = await sql`
      INSERT INTO responses
        (user_id, question_id, category_id, user_answer, correct_answer,
         is_correct, total_score, grade, tokens_saved)
      VALUES
        (${user.id}, ${questionId}, ${categoryId}, ${userAnswer}, ${correctAnswer},
         ${isCorrect}, ${totalScore}, ${grade}, ${tokensSaved})
      RETURNING id
    `

    return jsonResponse({ success: true, id: rows[0].id }, 200, request)
  } catch (err) {
    console.error('save response error:', err)
    return jsonResponse({ error: `Database error: ${err.message}` }, 500, request)
  }
}
