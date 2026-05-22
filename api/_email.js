/**
 * api/_email.js
 * Email sender using nodemailer with Gmail SMTP on port 465 (direct SSL).
 *
 * Uses explicit host/port — NOT `service: 'gmail'` — so nodemailer never
 * loads well-known/services.json and Vercel's bundler has nothing to miss.
 *
 * Required env vars:
 *   SMTP_USER      e.g. zerotokensai@gmail.com
 *   SMTP_PASSWORD  Google App Password (16 chars, spaces optional)
 *   SMTP_FROM      e.g. "Token Quest <zerotokensai@gmail.com>"
 *   APP_URL        e.g. https://www.zerotokens.ai
 */
import nodemailer from 'nodemailer'

/**
 * Credentials are passed in by the caller (register.js / invite.js) so they
 * are read from process.env in the Lambda handler where they are guaranteed
 * to be available, not inside this shared module.
 */
function makeTransport(user, pass) {
  if (!user || !pass) throw new Error(`SMTP credentials not provided (user:${!!user} pass:${!!pass})`)
  return nodemailer.createTransport({
    host:   'smtp.gmail.com',
    port:   465,
    secure: true,
    auth:   { user, pass },
  })
}

const APP_URL = process.env.APP_URL ?? 'https://www.zerotokens.ai'
const FROM    = process.env.SMTP_FROM ?? 'Token Quest <noreply@zerotokens.ai>'

// ── Exported senders ──────────────────────────────────────────────────────────

/**
 * Company employee invitation email.
 */
export async function sendInvitationEmail({ to, username, companyName, verifyToken, smtpUser, smtpPass }) {
  const link = `${APP_URL}/verify?token=${verifyToken}`
  const transport = makeTransport(smtpUser, smtpPass)
  await transport.sendMail({
    from:    FROM,
    to,
    subject: `You've been invited to Token Quest by ${companyName}`,
    text:    `Hi ${username},\n\n${companyName} has invited you to Token Quest.\n\nAccept your invitation: ${link}\n\nThis link expires in 7 days.\n\nToken Quest · ZeroTokens.ai`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 40px;">
        <div style="max-width: 480px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 40px; border: 1px solid #334155;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="font-size: 48px;">🤖</div>
            <h1 style="color: #00d4ff; font-size: 28px; margin: 8px 0;">TOKEN<span style="color: #a855f7">QUEST</span></h1>
            <p style="color: #64748b; font-size: 12px; margin: 0;">by ZeroTokens.ai</p>
          </div>
          <h2 style="color: #f1f5f9; font-size: 20px; margin-bottom: 8px;">Hi ${username},</h2>
          <p style="color: #94a3b8; line-height: 1.6;">
            <strong style="color: #00d4ff">${companyName}</strong> has invited you to complete your
            AI Prompt Optimisation certification on Token Quest.
          </p>
          <p style="color: #94a3b8; line-height: 1.6;">
            Click the button below to verify your email and set your password to get started.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${link}"
               style="background: linear-gradient(90deg, #0284c7, #a855f7); color: white;
                      text-decoration: none; padding: 14px 32px; border-radius: 12px;
                      font-weight: bold; font-size: 16px; display: inline-block;">
              ⚡ Accept Invitation
            </a>
          </div>
          <p style="color: #475569; font-size: 12px; line-height: 1.6;">
            Or copy this link:<br/>
            <a href="${link}" style="color: #00d4ff; word-break: break-all;">${link}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;" />
          <p style="color: #334155; font-size: 11px; text-align: center; margin: 0;">
            Token Quest · ZeroTokens.ai · This invitation expires in 7 days.
          </p>
        </div>
      </body>
      </html>
    `,
  })
}

/**
 * Individual user email verification email.
 */
export async function sendVerificationEmail({ to, username, verifyToken, smtpUser, smtpPass }) {
  const link = `${APP_URL}/verify?token=${verifyToken}`
  const transport = makeTransport(smtpUser, smtpPass)
  await transport.sendMail({
    from:    FROM,
    to,
    subject: 'Verify your Token Quest email',
    text:    `Hi ${username},\n\nVerify your Token Quest email: ${link}\n\nThis link expires in 24 hours.\n\nToken Quest · ZeroTokens.ai`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 40px;">
        <div style="max-width: 480px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 40px; border: 1px solid #334155;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="font-size: 48px;">🎮</div>
            <h1 style="color: #00d4ff; font-size: 28px; margin: 8px 0;">TOKEN<span style="color: #a855f7">QUEST</span></h1>
            <p style="color: #64748b; font-size: 12px; margin: 0;">by ZeroTokens.ai</p>
          </div>
          <h2 style="color: #f1f5f9; font-size: 20px; margin-bottom: 8px;">Hi ${username},</h2>
          <p style="color: #94a3b8; line-height: 1.6;">
            Thanks for signing up! Click the button below to verify your email and start your Token Quest.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${link}"
               style="background: linear-gradient(90deg, #0284c7, #a855f7); color: white;
                      text-decoration: none; padding: 14px 32px; border-radius: 12px;
                      font-weight: bold; font-size: 16px; display: inline-block;">
              ⚡ Verify Email &amp; Play
            </a>
          </div>
          <p style="color: #475569; font-size: 12px; line-height: 1.6;">
            Or copy this link:<br/>
            <a href="${link}" style="color: #00d4ff; word-break: break-all;">${link}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;" />
          <p style="color: #334155; font-size: 11px; text-align: center; margin: 0;">
            Token Quest · ZeroTokens.ai · This link expires in 24 hours.
          </p>
        </div>
      </body>
      </html>
    `,
  })
}

/**
 * Password reset email.
 */
export async function sendPasswordResetEmail({ to, username, resetToken, smtpUser, smtpPass }) {
  const link = `${APP_URL}/verify?token=${resetToken}&mode=reset`
  const transport = makeTransport(smtpUser, smtpPass)
  await transport.sendMail({
    from:    FROM,
    to,
    subject: 'Reset your Token Quest password',
    text:    `Hi ${username},\n\nReset your Token Quest password: ${link}\n\nExpires in 1 hour.\n\nToken Quest · ZeroTokens.ai`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 40px;">
        <div style="max-width: 480px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 40px; border: 1px solid #334155;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="font-size: 48px;">🔐</div>
            <h1 style="color: #00d4ff; font-size: 28px; margin: 8px 0;">TOKEN<span style="color: #a855f7">QUEST</span></h1>
            <p style="color: #64748b; font-size: 12px; margin: 0;">by ZeroTokens.ai</p>
          </div>
          <h2 style="color: #f1f5f9; font-size: 20px; margin-bottom: 8px;">Hi ${username},</h2>
          <p style="color: #94a3b8; line-height: 1.6;">
            You requested a password reset for your Token Quest account.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${link}"
               style="background: linear-gradient(90deg, #0284c7, #a855f7); color: white;
                      text-decoration: none; padding: 14px 32px; border-radius: 12px;
                      font-weight: bold; font-size: 16px; display: inline-block;">
              🔑 Reset Password
            </a>
          </div>
          <p style="color: #475569; font-size: 12px; line-height: 1.6;">
            Or copy this link:<br/>
            <a href="${link}" style="color: #00d4ff; word-break: break-all;">${link}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;" />
          <p style="color: #334155; font-size: 11px; text-align: center; margin: 0;">
            Token Quest · ZeroTokens.ai · This link expires in 1 hour.
          </p>
        </div>
      </body>
      </html>
    `,
  })
}
