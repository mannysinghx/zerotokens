/**
 * POST /api/company-admin/add-employee
 * Body: { username, email, password }
 *
 * Creates a company employee with a pre-set password.
 * Employee receives a verification email; clicking it auto-logs them in
 * (no set-password step because password_hash is already stored).
 *
 * Node.js runtime — SMTP requires TCP/TLS; Web Crypto for PBKDF2 hashing.
 */
import { sql } from '../_db_node.js'
import { generateSalt, hashPassword, generateToken } from '../_auth.js'
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
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' })

  try {
    const authHeader    = req.headers.authorization ?? ''
    const sessionToken  = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null
    if (!sessionToken)  return res.status(401).json({ error: 'Unauthorized' })

    await sql`ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS is_company_admin BOOLEAN NOT NULL DEFAULT FALSE`

    const adminRows = await sql`
      SELECT u.id, ep.company_id, ep.is_company_admin, c.name AS company_name
      FROM   sessions s
      JOIN   users             u  ON u.id  = s.user_id
      JOIN   employee_profiles ep ON ep.user_id = u.id
      JOIN   companies         c  ON c.id = ep.company_id
      WHERE  s.token = ${sessionToken}
        AND  s.expires_at > NOW()
        AND  ep.is_company_admin = TRUE
      LIMIT 1
    `
    if (adminRows.length === 0) return res.status(401).json({ error: 'Unauthorized — company admin access required' })

    const admin = adminRows[0]
    const { username, email, password } = req.body ?? {}

    if (!username?.trim())   return res.status(400).json({ error: 'username is required' })
    if (!email?.trim())      return res.status(400).json({ error: 'email is required' })
    if (!password)           return res.status(400).json({ error: 'password is required' })
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })

    const emailLower = email.trim().toLowerCase()

    // Duplicate check
    const existing = await sql`SELECT id FROM users WHERE email = ${emailLower} LIMIT 1`
    if (existing.length > 0) return res.status(409).json({ error: 'A user with this email already exists' })

    // Hash password with PBKDF2 (Web Crypto — available in Node.js 18+)
    const salt = generateSalt()
    const hash = await hashPassword(password, salt)

    // Create user with password pre-set; email_verified = false until they click the link
    const userRows = await sql`
      INSERT INTO users (email, username, password_hash, password_salt, user_type, email_verified)
      VALUES (${emailLower}, ${username.trim()}, ${hash}, ${salt}, 'company', FALSE)
      RETURNING id, email, username, user_type, created_at
    `
    const user = userRows[0]

    // Create employee profile linked to admin's company
    await sql`INSERT INTO employee_profiles (user_id, company_id) VALUES (${user.id}, ${admin.company_id})`

    // Generate 7-day verify token
    const verifyToken = generateToken()
    const expiresAt   = new Date(Date.now() + 7 * 86_400_000).toISOString()
    await sql`INSERT INTO email_verifications (user_id, token, expires_at) VALUES (${user.id}, ${verifyToken}, ${expiresAt})`

    // Send invitation email (password_hash present → verify-email will auto-login them)
    const smtpUser = (process.env.SMTP_USER     ?? '').trim()
    const smtpPass = (process.env.SMTP_PASSWORD ?? '').replace(/\s/g, '').trim()
    await sendInvitationEmail({
      to:          user.email,
      username:    user.username,
      companyName: admin.company_name,
      verifyToken,
      smtpUser,
      smtpPass,
    })

    return res.status(201).json({ user })
  } catch (err) {
    console.error('company-admin/add-employee error:', err)
    return res.status(500).json({ error: err.message })
  }
}
