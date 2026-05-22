/**
 * POST /api/responses/save
 * Body: { employeeId, questionId, categoryId, userAnswer, correctAnswer,
 *         isCorrect, totalScore, grade, tokensSaved }
 */
import { sql, jsonResponse, handleOptions } from '../_db.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions()
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  try {
    const {
      employeeId, questionId, categoryId,
      userAnswer = null, correctAnswer = null,
      isCorrect = false, totalScore = 0,
      grade = 'D', tokensSaved = 0,
    } = await request.json()

    if (!employeeId || !questionId || !categoryId) {
      return jsonResponse({ error: 'employeeId, questionId, and categoryId are required' }, 400)
    }

    const rows = await sql`
      INSERT INTO responses
        (employee_id, question_id, category_id, user_answer, correct_answer,
         is_correct, total_score, grade, tokens_saved)
      VALUES
        (${employeeId}, ${questionId}, ${categoryId}, ${userAnswer}, ${correctAnswer},
         ${isCorrect}, ${totalScore}, ${grade}, ${tokensSaved})
      RETURNING id
    `

    return jsonResponse({ success: true, id: rows[0].id })
  } catch (err) {
    console.error('save response error:', err)
    return jsonResponse({ error: 'Database error' }, 500)
  }
}
