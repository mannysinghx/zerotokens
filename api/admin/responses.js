/**
 * GET /api/admin/responses
 * Query params: userId?, categoryId?, limit=200
 * Returns responses for the admin response viewer.
 * Requires x-admin-password header.
 */
import { sql, jsonResponse, handleOptions, isAdmin } from '../_db.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions(request)
  if (!isAdmin(request)) return jsonResponse({ error: 'Unauthorized' }, 401, request)
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  try {
    const url        = new URL(request.url)
    const userId     = url.searchParams.get('userId')
    const categoryId = url.searchParams.get('categoryId')
    const limit      = Math.min(parseInt(url.searchParams.get('limit') ?? '200', 10), 1000)

    let rows
    if (userId && categoryId) {
      rows = await sql`
        SELECT r.*, u.username, u.email, u.user_type, c.name AS company_name,
               q.title AS question_title, q.sub_function
        FROM responses r
        JOIN users u      ON u.id = r.user_id
        LEFT JOIN companies c ON c.id = u.company_id
        JOIN questions q  ON q.id = r.question_id
        WHERE r.user_id = ${userId} AND r.category_id = ${categoryId}
        ORDER BY r.answered_at DESC
        LIMIT ${limit}
      `
    } else if (userId) {
      rows = await sql`
        SELECT r.*, u.username, u.email, u.user_type, c.name AS company_name,
               q.title AS question_title, q.sub_function
        FROM responses r
        JOIN users u      ON u.id = r.user_id
        LEFT JOIN companies c ON c.id = u.company_id
        JOIN questions q  ON q.id = r.question_id
        WHERE r.user_id = ${userId}
        ORDER BY r.answered_at DESC
        LIMIT ${limit}
      `
    } else if (categoryId) {
      rows = await sql`
        SELECT r.*, u.username, u.email, u.user_type, c.name AS company_name,
               q.title AS question_title, q.sub_function
        FROM responses r
        JOIN users u      ON u.id = r.user_id
        LEFT JOIN companies c ON c.id = u.company_id
        JOIN questions q  ON q.id = r.question_id
        WHERE r.category_id = ${categoryId}
        ORDER BY r.answered_at DESC
        LIMIT ${limit}
      `
    } else {
      rows = await sql`
        SELECT r.*, u.username, u.email, u.user_type, c.name AS company_name,
               q.title AS question_title, q.sub_function
        FROM responses r
        JOIN users u      ON u.id = r.user_id
        LEFT JOIN companies c ON c.id = u.company_id
        JOIN questions q  ON q.id = r.question_id
        ORDER BY r.answered_at DESC
        LIMIT ${limit}
      `
    }

    return jsonResponse({ responses: rows }, 200, request)
  } catch (err) {
    console.error('admin responses error:', err)
    return jsonResponse({ error: `Database error: ${err.message}` }, 500, request)
  }
}
