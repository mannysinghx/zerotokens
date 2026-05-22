/**
 * POST /api/admin/invite
 * Body: { email, username, companyId }
 * Creates a company employee, generates a 7-day verification token,
 * and sends an invitation email via Gmail SMTP.
 * Requires x-admin-password header.
 * Node.js runtime (req/res style) — SMTP requires TCP/TLS.
 */
import { sql } from '../_db.js'
import { generateToken } from '../_auth.js'
import { sendInvitationEmail } from '../_email.js'

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
  if (req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' })
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { email, username, companyId } = req.body ?? {}

    if (!email?.trim())    return res.status(400).json({ error: 'email is required' })
    if (!username?.trim()) return res.status(400).json({ error: 'username is required' })
    if (!companyId)        return res.status(400).json({ error: 'companyId is required' })

    // Validate company exists
    const compRows = await sql`SELECT id, name FROM companies WHERE id = ${companyId} LIMIT 1`
    if (compRows.length === 0) return res.status(404).json({ error: 'Company not found' })
    const companyName = compRows[0].name

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
    const token     = generateToken()
    const expiresAt = new Date(Date.now() + 7 * 86_400_000).toISOString()
    await sql`INSERT INTO email_verifications (user_id, token, expires_at) VALUES (${user.id}, ${token}, ${expiresAt})`

    // Send invitation email
    await sendInvitationEmail({ to: user.email, username: user.username, companyName, verifyToken: token })

    const appUrl = process.env.APP_URL ?? 'https://www.zerotokens.ai'
    return res.status(201).json({ user, inviteUrl: `${appUrl}/verify?token=${token}` })
  } catch (err) {
    console.error('invite error:', err)
    return res.status(500).json({ error: err.message })
  }
}
