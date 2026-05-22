/**
 * POST /api/company-admin/resend-invite
 * Body: { userId }
 *
 * Resends an invitation email to a pending (unverified) employee.
 * Invalidates any previous unused token and creates a fresh 7-day one.
 * Verifies the target belongs to the admin's company.
 *
 * Node.js runtime — SMTP requires TCP/TLS.
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
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null
    if (!bearerToken) return res.status(401).json({ error: 'Unauthorized' })

    await sql`ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS is_company_admin BOOLEAN NOT NULL DEFAULT FALSE`

    const adminRows = await sql`
      SELECT u.id, ep.company_id, ep.is_company_admin, c.name AS company_name
      FROM   sessions s
      JOIN   users              u  ON u.id  = s.user_id
      JOIN   employee_profiles  ep ON ep.user_id = u.id
      JOIN   companies          c  ON c.id = ep.company_id
      WHERE  s.token = ${bearerToken}
        AND  s.expires_at > NOW()
        AND  ep.is_company_admin = TRUE
      LIMIT 1
    `
    if (adminRows.length === 0) return res.status(401).json({ error: 'Unauthorized' })

    const admin = adminRows[0]
    const { userId } = req.body ?? {}
    if (!userId) return res.status(400).json({ error: 'userId is required' })

    // Verify the employee belongs to this company and is still pending
    const empRows = await sql`
      SELECT u.id, u.email, u.username, u.email_verified, u.password_hash
      FROM   users u
      INNER JOIN employee_profiles ep ON ep.user_id = u.id
      WHERE  u.id = ${userId}
        AND  ep.company_id = ${admin.company_id}
      LIMIT 1
    `
    if (empRows.length === 0) return res.status(404).json({ error: 'Employee not found in your company' })

    const emp = empRows[0]
    if (emp.email_verified && emp.password_hash) {
      return res.status(400).json({ error: 'This employee has already verified their account. Use "Change Password" instead.' })
    }

    // Invalidate all existing unused tokens for this user
    await sql`
      UPDATE email_verifications
      SET    used = TRUE
      WHERE  user_id = ${userId} AND used = FALSE
    `

    // Create a fresh 7-day token
    const token     = generateToken()
    const expiresAt = new Date(Date.now() + 7 * 86_400_000).toISOString()
    await sql`INSERT INTO email_verifications (user_id, token, expires_at) VALUES (${userId}, ${token}, ${expiresAt})`

    // Send the invitation email
    const smtpUser = (process.env.SMTP_USER     ?? '').trim()
    const smtpPass = (process.env.SMTP_PASSWORD ?? '').replace(/\s/g, '').trim()
    await sendInvitationEmail({
      to:          emp.email,
      username:    emp.username,
      companyName: admin.company_name,
      verifyToken: token,
      smtpUser,
      smtpPass,
    })

    return res.status(200).json({ message: `Invitation resent to ${emp.email}` })
  } catch (err) {
    console.error('resend-invite error:', err)
    return res.status(500).json({ error: err.message })
  }
}
