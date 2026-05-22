/**
 * Patches nodemailer's well-known/index.js to replace the runtime
 * require('./services.json') with an empty object literal.
 *
 * WHY: Vercel's nft (Node File Tracer) only traces .js files, so
 * services.json never makes it into the Lambda bundle, causing a
 * FUNCTION_INVOCATION_FAILED crash on cold start.
 *
 * SAFE: We use nodemailer with explicit host/port — the "named
 * service" lookup (gmail, yahoo, etc.) is never used.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const target = 'node_modules/nodemailer/lib/well-known/index.js'

if (!existsSync(target)) {
  console.log('patch-nodemailer: file not found, skipping')
  process.exit(0)
}

const src = readFileSync(target, 'utf8')

if (!src.includes("require('./services.json')")) {
  console.log('patch-nodemailer: already patched, nothing to do')
  process.exit(0)
}

writeFileSync(target, src.replace("require('./services.json')", '{}'))
console.log('patch-nodemailer: patched well-known/index.js ✓')
