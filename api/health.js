/**
 * GET /api/health
 * Public endpoint — tests DB connectivity and reports table status.
 * Visit this URL directly to diagnose connection issues.
 */
import { sql, jsonResponse, handleOptions, corsHeaders } from './_db.js'

export const config = { runtime: 'edge' }

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions(request)

  try {
    // Check which tables exist
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    const tableNames = tables.map(t => t.table_name)
    const required   = ['categories', 'questions', 'employees', 'assignments', 'responses']
    const missing    = required.filter(t => !tableNames.includes(t))

    return jsonResponse({
      status:  missing.length === 0 ? 'ok' : 'schema_missing',
      tables:  tableNames,
      missing,
      message: missing.length === 0
        ? 'DB connected and all tables present.'
        : `Run db/schema.sql in Neon. Missing: ${missing.join(', ')}`,
    }, 200, request)
  } catch (err) {
    return new Response(JSON.stringify({
      status:  'error',
      message: err.message,
      hint:    'Check that DATABASE_URL is set correctly in Vercel environment variables.',
    }), {
      status:  500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
    })
  }
}
