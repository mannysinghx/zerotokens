/**
 * api/_db.js
 * Shared Neon database connection helper for all API routes.
 * Uses @neondatabase/serverless for HTTP-based connections
 * compatible with Vercel serverless functions.
 */
import { neon } from '@neondatabase/serverless'

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!connectionString) {
  throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required')
}

// neon() returns a tagged-template SQL executor
export const sql = neon(connectionString)

/**
 * CORS headers for all API responses
 */
export const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

/**
 * Send a JSON response with proper headers
 */
export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })
}

/**
 * Handle OPTIONS preflight requests
 */
export function handleOptions() {
  return new Response(null, { status: 204, headers: CORS })
}

/**
 * Verify admin password from request headers
 */
export function isAdmin(request) {
  const auth = request.headers.get('x-admin-password')
  return auth === process.env.ADMIN_PASSWORD
}
