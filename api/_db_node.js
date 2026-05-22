/**
 * api/_db_node.js
 * PostgreSQL client for Node.js Serverless Functions.
 * Uses the `postgres` package (native TCP) instead of @neondatabase/serverless
 * (which is optimised for Edge/HTTP and has bundling issues in Node.js Lambda).
 *
 * Import this (not _db.js) from Node.js functions: invite.js, register.js.
 */
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL
if (!connectionString) {
  throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required')
}

// max:1 — single connection per Lambda invocation (avoids pool exhaustion)
export const sql = postgres(connectionString, { max: 1, idle_timeout: 5 })
