/**
 * POST /api/company-admin/invite
 * Body: { email, username }
 * company_id comes from the authenticated company admin's session — NOT from request body.
 * Creates a company employee, generates a 7-day verification token,
 * and sends an invitation email via Gmail SMTP.
 * Node.js runtime (req/res style) — SMTP requires TCP/TLS.
 */
import { sql } from '../_db_node.js'
import { generateToken } from '../_auth.js'
import { sendInvitationEmail } from '../_email.js'

const ALLOWED_ORIGINS = [
  'https://www.zerotokens.ai',
  'https://zerotokens.ai',
  'http://localhost:5173',
  'http://localhost:3000',
]

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
    // Validate session and company admin status
    const authHeader = req.headers.authorization ?? ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null
    if (!token) return res.status(401).json({ error: 'Unauthorized — no token' })

    // Run migration idempotently
    await sql`ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS is_company_admin BOOLEAN NOT NULL DEFAULT FALSE`

    const adminRows = await sql`
      SELECT u.*, ep.company_id, ep.is_company_admin, c.name AS company_name
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      JOIN employee_profiles ep ON ep.user_id = u.id
      JOIN companies c ON c.id = ep.company_id
      WHERE s.token = ${token}
        AND s.expires_at > NOW()
        AND ep.is_company_admin = TRUE
      LIMIT 1
    `

    if (adminRows.length === 0) {
      return res.status(401).json({ error: 'Unauthorized — company admin access required' })
    }

    const admin = adminRows[0]
    const companyId   = admin.company_id
    const companyName = admin.company_name

    const { email, username } = req.body ?? {}

    if (!email?.trim())    return res.status(400).json({ error: 'email is required' })
    if (!username?.trim()) return res.status(400).json({ error: 'username is required' })

    // Check for duplicate email
    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase().trim()} LIMIT 1`
    if (existing.length > 0) return res.status(409).json({ error: 'A user with this email already exists' })

    // Create user (no password until email verified)
    const userRows = await sql`
      INSERT INTO users (email, username, user_type, email_verified)
      VALUES (${email.toLowerCase().trim()}, ${username.trim()}, 'company', FALSE)
      RETURNING id, email, username, user_type, created_at
    `
    const user = userRows[0]

    // Create company-specific profile
    await sql`INSERT INTO employee_profiles (user_id, company_id) VALUES (${user.id}, ${companyId})`

    // Generate secure token (7-day expiry)
    const verifyToken = generateToken()
    const expiresAt   = new Date(Date.now() + 7 * 86_400_000).toISOString()
    await sql`INSERT INTO email_verifications (user_id, token, expires_at) VALUES (${user.id}, ${verifyToken}, ${expiresAt})`

    // Send invitation email
    const smtpUser = (process.env.SMTP_USER     ?? '').trim()
    const smtpPass = (process.env.SMTP_PASSWORD ?? '').replace(/\s/g, '').trim()
    await sendInvitationEmail({
      to:          user.email,
      username:    user.username,
      companyName,
      verifyToken,
      smtpUser,
      smtpPass,
    })

    const appUrl = process.env.APP_URL ?? 'https://www.zerotokens.ai'
    return res.status(201).json({ user, inviteUrl: `${appUrl}/verify?token=${verifyToken}` })
  } catch (err) {
    console.error('company-admin/invite error:', err)
    return res.status(500).json({ error: err.message })
  }
}
