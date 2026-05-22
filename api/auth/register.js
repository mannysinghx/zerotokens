/**
 * POST /api/auth/register
 * Register a new individual learner with email + password.
 * Creates an unverified account, sends a verification email via Gmail SMTP,
 * and returns a prompt to check email — no session until link is clicked.
 * Company employees are created via /api/admin/invite.
 * Node.js runtime (req/res style) — SMTP requires TCP/TLS.
 */
import { sql } from '../_db.js'
import { generateSalt, hashPassword, generateToken } from '../_auth.js'
import { sendVerificationEmail } from '../_email.js'

const ALLOWED_ORIGINS = ['https://www.zerotokens.ai', 'https://zerotokens.ai', 'http://localhost:5173', 'http://localhost:3000']

function cors(req, res) {
  const origin = req.headers.origin ?? ''
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS.includes(origin) ? origin : 'https://www.zerotokens.ai')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-password')
  res.setHeader('Vary', 'Origin')
}

export default async function handler(req, res) {
  cors(req, res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { username, email, password } = req.body ?? {}

    if (!username?.trim())   return res.status(400).json({ error: 'Username is required' })
    if (!email?.trim())      return res.status(400).json({ error: 'Email is required' })
    if (!password)           return res.status(400).json({ error: 'Password is required' })
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })

    const emailLower = email.trim().toLowerCase()

    const existing = await sql`SELECT id FROM users WHERE email = ${emailLower} LIMIT 1`
    if (existing.length > 0) return res.status(409).json({ error: 'An account with this email already exists.' })

    const salt = generateSalt()
    const hash = await hashPassword(password, salt)

    const rows = await sql`
      INSERT INTO users (email, username, password_hash, password_salt, user_type, email_verified)
      VALUES (${emailLower}, ${username.trim()}, ${hash}, ${salt}, 'individual', FALSE)
      RETURNING id, email, username, user_type, created_at
    `
    const user = rows[0]

    // Generate secure token (24-hour expiry)
    const verifyToken = generateToken()
    const expiresAt   = new Date(Date.now() + 24 * 60 * 60_000).toISOString()
    await sql`INSERT INTO email_verifications (user_id, token, expires_at) VALUES (${user.id}, ${verifyToken}, ${expiresAt})`

    // Send verification email
    await sendVerificationEmail({ to: user.email, username: user.username, verifyToken })

    return res.status(201).json({ message: 'Check your email to verify your account.' })
  } catch (err) {
    console.error('register error:', err)
    return res.status(500).json({ error: err.message })
  }
}
