/**
 * GET /api/admin/responses
 * Query params: employeeId?, categoryId?, limit=100
 * Returns responses for the admin response viewer (supports CSV export).
 */
import { sql, jsonResponse, handleOptions, isAdmin } from '../_db.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions()
  if (!isAdmin(request)) return jsonResponse({ error: 'Unauthorized' }, 401)
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405)

  try {
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    const categoryId = url.searchParams.get('categoryId')
    const limit      = Math.min(parseInt(url.searchParams.get('limit') ?? '200', 10), 1000)

    // Build dynamic WHERE clause
    let rows
    if (employeeId && categoryId) {
      rows = await sql`
        SELECT r.*, e.username, e.team, e.company, q.title AS question_title, q.sub_function
        FROM responses r
        JOIN employees e ON e.id = r.employee_id
        JOIN questions q ON q.id = r.question_id
        WHERE r.employee_id = ${employeeId} AND r.category_id = ${categoryId}
        ORDER BY r.answered_at DESC
        LIMIT ${limit}
      `
    } else if (employeeId) {
      rows = await sql`
        SELECT r.*, e.username, e.team, e.company, q.title AS question_title, q.sub_function
        FROM responses r
        JOIN employees e ON e.id = r.employee_id
        JOIN questions q ON q.id = r.question_id
        WHERE r.employee_id = ${employeeId}
        ORDER BY r.answered_at DESC
        LIMIT ${limit}
      `
    } else if (categoryId) {
      rows = await sql`
        SELECT r.*, e.username, e.team, e.company, q.title AS question_title, q.sub_function
        FROM responses r
        JOIN employees e ON e.id = r.employee_id
        JOIN questions q ON q.id = r.question_id
        WHERE r.category_id = ${categoryId}
        ORDER BY r.answered_at DESC
        LIMIT ${limit}
      `
    } else {
      rows = await sql`
        SELECT r.*, e.username, e.team, e.company, q.title AS question_title, q.sub_function
        FROM responses r
        JOIN employees e ON e.id = r.employee_id
        JOIN questions q ON q.id = r.question_id
        ORDER BY r.answered_at DESC
        LIMIT ${limit}
      `
    }

    return jsonResponse({ responses: rows })
  } catch (err) {
    console.error('admin responses error:', err)
    return jsonResponse({ error: 'Database error' }, 500)
  }
}
