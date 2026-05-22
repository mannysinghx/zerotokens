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
 * Allowed CORS origins.
 * Same-origin requests (app + API on same Vercel deployment) don't need this,
 * but it's good practice for explicit security.
 */
const ALLOWED_ORIGINS = new Set([
  'https://www.zerotokens.ai',
  'https://zerotokens.ai',
  'http://localhost:5173',   // vite dev
  'http://localhost:3000',   // vercel dev
])

/**
 * Build CORS headers, reflecting the request's Origin if it's allowed.
 */
export function corsHeaders(request) {
  const origin = request?.headers?.get('origin') ?? ''
  const allowedOrigin = ALLOWED_ORIGINS.has(origin)
    ? origin
    : 'https://www.zerotokens.ai'
  return {
    'Access-Control-Allow-Origin':  allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-password',
    'Vary': 'Origin',
  }
}

/**
 * Send a JSON response with proper headers
 */
export function jsonResponse(data, status = 200, request = null) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
  })
}

/**
 * Handle OPTIONS preflight requests
 */
export function handleOptions(request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) })
}

/**
 * Verify admin password from request headers
 */
export function isAdmin(request) {
  const auth = request.headers.get('x-admin-password')
  return auth === process.env.ADMIN_PASSWORD
}
