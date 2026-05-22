/**
 * api/_email.js
 * SMTP email helper using nodemailer.
 * Uses Node.js runtime (NOT edge) — import only from Node.js API routes.
 *
 * Required env vars:
 *   SMTP_HOST      e.g. smtp.gmail.com
 *   SMTP_PORT      e.g. 587
 *   SMTP_USER      e.g. hello@zerotokens.ai
 *   SMTP_PASSWORD  App password / SMTP password
 *   SMTP_FROM      e.g. "Token Quest <noreply@zerotokens.ai>"
 */
import nodemailer from 'nodemailer'

function getTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT ?? '587'),
    secure: parseInt(process.env.SMTP_PORT ?? '587') === 465,
    auth: {
      user: process.env.SMTP_USER,
      // Strip spaces — Google App Passwords are shown with spaces for readability
      // but the SMTP server expects the 16 chars with no spaces.
      pass: (process.env.SMTP_PASSWORD ?? '').replace(/\s/g, ''),
    },
  })
}

const FROM = process.env.SMTP_FROM ?? 'Token Quest <noreply@zerotokens.ai>'
const APP_URL = process.env.APP_URL ?? 'https://www.zerotokens.ai'

/**
 * Send a company employee invitation email with verification link.
 */
export async function sendInvitationEmail({ to, username, companyName, verifyToken }) {
  const link = `${APP_URL}/verify?token=${verifyToken}`
  const transporter = getTransporter()
  await transporter.sendMail({
    from:    FROM,
    to,
    subject: `You've been invited to Token Quest by ${companyName}`,
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
            Or copy this link into your browser:<br/>
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
    text: `Hi ${username},\n\n${companyName} has invited you to Token Quest.\n\nAccept your invitation: ${link}\n\nThis link expires in 7 days.\n\nToken Quest · ZeroTokens.ai`,
  })
}

/**
 * Send an email verification link to a self-registered individual user.
 */
export async function sendVerificationEmail({ to, username, verifyToken }) {
  const link = `${APP_URL}/verify?token=${verifyToken}`
  const transporter = getTransporter()
  await transporter.sendMail({
    from:    FROM,
    to,
    subject: 'Verify your Token Quest email',
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
            Thanks for signing up! Click the button below to verify your email address and start your Token Quest.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${link}"
               style="background: linear-gradient(90deg, #0284c7, #a855f7); color: white;
                      text-decoration: none; padding: 14px 32px; border-radius: 12px;
                      font-weight: bold; font-size: 16px; display: inline-block;">
              ⚡ Verify Email & Play
            </a>
          </div>

          <p style="color: #475569; font-size: 12px; line-height: 1.6;">
            Or copy this link into your browser:<br/>
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
    text: `Hi ${username},\n\nVerify your Token Quest email: ${link}\n\nThis link expires in 24 hours.\n\nToken Quest · ZeroTokens.ai`,
  })
}

/**
 * Send a password reset email.
 */
export async function sendPasswordResetEmail({ to, username, resetToken }) {
  const link = `${APP_URL}/verify?token=${resetToken}&mode=reset`
  const transporter = getTransporter()
  await transporter.sendMail({
    from:    FROM,
    to,
    subject: 'Reset your Token Quest password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px;">
        <h2>Hi ${username},</h2>
        <p>You requested a password reset for your Token Quest account.</p>
        <p><a href="${link}" style="background:#0284c7;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Reset Password</a></p>
        <p style="color:#94a3b8;font-size:12px;">Link: ${link}<br/>Expires in 1 hour.</p>
      </div>
    `,
    text: `Hi ${username},\n\nReset your password: ${link}\n\nExpires in 1 hour.`,
  })
}
