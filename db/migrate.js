/**
 * db/migrate.js
 * Run: node db/migrate.js
 * Applies migration_002_auth.sql to Neon via the unpooled connection.
 */
import postgres from 'postgres'
import { readFileSync } from 'fs'
import { config } from 'dotenv'

config({ path: '.env.local' })

const url = process.env.POSTGRES_URL_NON_POOLING
if (!url) {
  console.error('Missing POSTGRES_URL_NON_POOLING in .env.local')
  process.exit(1)
}

const sql = postgres(url, { ssl: 'require', prepare: false })
const schema = readFileSync(new URL('./migration_002_auth.sql', import.meta.url), 'utf8')

console.log('⚡ Running migration 002 (auth system)…')
try {
  await sql.unsafe(schema)
  console.log('✅ Migration complete.')
} catch (err) {
  console.error('❌ Migration failed:', err.message)
  process.exit(1)
} finally {
  await sql.end()
}
