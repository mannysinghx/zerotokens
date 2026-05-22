/**
 * POST /api/auth/register
 * Register a new individual learner with email + password.
 * Creates an unverified account, sends a verification email, and returns
 * a prompt to check email — no session is issued until the link is clicked.
 * Company employees are created via /api/admin/invite.
 *
 * Node.js runtime (no edge config) — nodemailer requires Node.js.
 */
import { randomBytes } from 'node:crypto'
import { sql, jsonResponse, handleOptions } from '../_db.js'
import { generateSalt, hashPassword } from '../_auth.js'
import { sendVerificationEmail } from '../_email.js'

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions(request)
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  try {
    const { username, email, password } = await request.json()

    if (!username?.trim())   return jsonResponse({ error: 'Username is required' }, 400, request)
    if (!email?.trim())      return jsonResponse({ error: 'Email is required' }, 400, request)
    if (!password)           return jsonResponse({ error: 'Password is required' }, 400, request)
    if (password.length < 8) return jsonResponse({ error: 'Password must be at least 8 characters' }, 400, request)

    const emailLower = email.trim().toLowerCase()

    const existing = await sql`SELECT id FROM users WHERE email = ${emailLower} LIMIT 1`
    if (existing.length > 0) {
      return jsonResponse({ error: 'An account with this email already exists.' }, 409, request)
    }

    const salt = generateSalt()
    const hash = await hashPassword(password, salt)

    const rows = await sql`
      INSERT INTO users (email, username, password_hash, password_salt, user_type, email_verified)
      VALUES (${emailLower}, ${username.trim()}, ${hash}, ${salt}, 'individual', FALSE)
      RETURNING id, email, username, user_type, company_id, created_at
    `
    const user = rows[0]

    const verifyToken = randomBytes(48).toString('hex')
    const expiresAt   = new Date(Date.now() + 24 * 60 * 60_000).toISOString() // 24 hours

    await sql`
      INSERT INTO email_verifications (user_id, token, expires_at)
      VALUES (${user.id}, ${verifyToken}, ${expiresAt})
    `

    await sendVerificationEmail({
      to:          user.email,
      username:    user.username,
      verifyToken,
    })

    return jsonResponse({ message: 'Check your email to verify your account.' }, 201, request)
  } catch (err) {
    console.error('register error:', err)
    const isEmailErr = /SMTP|ECONNREFUSED|auth|login|password/i.test(err.message ?? '')
    return jsonResponse({
      error: isEmailErr
        ? `Failed to send verification email: ${err.message}`
        : `Registration failed: ${err.message}`,
    }, 500, request)
  }
}
