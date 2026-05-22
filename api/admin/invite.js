/**
 * POST /api/admin/invite
 * Body: { email, username, companyId }
 * Creates a company employee, generates a 7-day verification token,
 * and sends an invitation email via Gmail SMTP.
 * Requires x-admin-password header.
 */
import { sql, jsonResponse, handleOptions, isAdmin } from '../_db.js'
import { generateToken } from '../_auth.js'
import { sendInvitationEmail } from '../_email.js'

export default async function handler(request) {
  if (request.method === 'OPTIONS') return handleOptions(request)
  if (!isAdmin(request)) return jsonResponse({ error: 'Unauthorized' }, 401, request)
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  try {
    const { email, username, companyId } = await request.json()

    if (!email?.trim())    return jsonResponse({ error: 'email is required' },     400, request)
    if (!username?.trim()) return jsonResponse({ error: 'username is required' },  400, request)
    if (!companyId)        return jsonResponse({ error: 'companyId is required' }, 400, request)

    // Validate company exists
    const compRows = await sql`SELECT id, name FROM companies WHERE id = ${companyId} LIMIT 1`
    if (compRows.length === 0) return jsonResponse({ error: 'Company not found' }, 404, request)
    const companyName = compRows[0].name

    // Check for duplicate email
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase().trim()} LIMIT 1
    `
    if (existing.length > 0) {
      return jsonResponse({ error: 'A user with this email already exists' }, 409, request)
    }

    // Create user (no password until email verified)
    const userRows = await sql`
      INSERT INTO users (email, username, user_type, email_verified)
      VALUES (
        ${email.toLowerCase().trim()},
        ${username.trim()},
        'company',
        FALSE
      )
      RETURNING id, email, username, user_type, created_at
    `
    const user = userRows[0]

    // Create company-specific profile
    await sql`
      INSERT INTO employee_profiles (user_id, company_id)
      VALUES (${user.id}, ${companyId})
    `

    // Generate secure token (7-day expiry)
    const token     = generateToken()
    const expiresAt = new Date(Date.now() + 7 * 86_400_000).toISOString()

    await sql`
      INSERT INTO email_verifications (user_id, token, expires_at)
      VALUES (${user.id}, ${token}, ${expiresAt})
    `

    // Send invitation email
    await sendInvitationEmail({
      to:          user.email,
      username:    user.username,
      companyName,
      verifyToken: token,
    })

    const appUrl = process.env.APP_URL ?? 'https://www.zerotokens.ai'
    return jsonResponse(
      { user, inviteUrl: `${appUrl}/verify?token=${token}` },
      201,
      request,
    )
  } catch (err) {
    console.error('invite error:', err)
    return jsonResponse({ error: err.message }, 500, request)
  }
}
