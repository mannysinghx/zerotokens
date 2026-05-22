/**
 * api/_email.js
 * Minimal SMTP client using Node.js built-in net/tls.
 * Zero npm dependencies — no bundling issues on Vercel Node.js functions.
 *
 * Required env vars:
 *   SMTP_HOST      e.g. smtp.gmail.com
 *   SMTP_PORT      e.g. 587
 *   SMTP_USER      e.g. zerotokensai@gmail.com
 *   SMTP_PASSWORD  Google App Password (spaces are stripped automatically)
 *   SMTP_FROM      e.g. "Token Quest <zerotokensai@gmail.com>"
 */
import * as net from 'node:net'
import * as tls from 'node:tls'

function b64(s) {
  return Buffer.from(String(s)).toString('base64')
}

function buildMime({ from, to, subject, html, text }) {
  const boundary = `TQ${Date.now()}`
  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    `Content-Type: text/plain; charset=utf-8`,
    '',
    text,
    '',
    `--${boundary}`,
    `Content-Type: text/html; charset=utf-8`,
    '',
    html,
    '',
    `--${boundary}--`,
  ].join('\r\n')
}

async function smtpSend({ from, to, subject, html, text }) {
  const host = process.env.SMTP_HOST     ?? 'smtp.gmail.com'
  const port = parseInt(process.env.SMTP_PORT ?? '587')
  const user = process.env.SMTP_USER     ?? ''
  const pass = (process.env.SMTP_PASSWORD ?? '').replace(/\s/g, '')

  return new Promise((resolve, reject) => {
    const done  = (err) => err ? reject(err) : resolve()
    const timer = setTimeout(() => done(new Error('SMTP timeout after 20s')), 20_000)

    let buf  = ''
    let sock = null   // raw TCP socket
    let conn = null   // active socket (upgraded to TLS after STARTTLS)
    let step = 'greeting'

    const cmd = (s) => conn.write(s + '\r\n')

    // Called once per complete SMTP response line (last line of multi-line responses only)
    const onResponse = (code, msg) => {
      if (code >= 400) {
        clearTimeout(timer)
        return done(new Error(`SMTP ${code}: ${msg.trim()}`))
      }

      if (step === 'greeting') {
        step = 'ehlo'
        cmd(`EHLO ${host}`)

      } else if (step === 'ehlo') {
        step = 'starttls'
        cmd('STARTTLS')

      } else if (step === 'starttls') {
        // Upgrade raw TCP socket to TLS (STARTTLS)
        step = 'upgrading'
        sock.removeAllListeners('data')
        const tlsSock = tls.connect({ socket: sock, host, servername: host }, () => {
          conn = tlsSock
          tlsSock.on('data', onData)
          step = 'ehlo2'
          cmd(`EHLO ${host}`)
        })
        tlsSock.on('error', (err) => { clearTimeout(timer); done(err) })

      } else if (step === 'ehlo2') {
        step = 'auth'
        cmd('AUTH LOGIN')

      } else if (step === 'auth') {
        step = 'user'
        cmd(b64(user))

      } else if (step === 'user') {
        step = 'pass'
        cmd(b64(pass))

      } else if (step === 'pass') {
        const addr = from.match(/<(.+)>/)?.[1] ?? from
        step = 'mail-from'
        cmd(`MAIL FROM:<${addr}>`)

      } else if (step === 'mail-from') {
        step = 'rcpt-to'
        cmd(`RCPT TO:<${to}>`)

      } else if (step === 'rcpt-to') {
        step = 'data'
        cmd('DATA')

      } else if (step === 'data') {
        const mime    = buildMime({ from, to, subject, html, text })
        // Dot-stuffing: RFC 5321 §4.5.2 — lines starting with '.' get an extra '.'
        const stuffed = mime.split('\r\n').map(l => l.startsWith('.') ? '.' + l : l).join('\r\n')
        step = 'body'
        cmd(stuffed + '\r\n.')

      } else if (step === 'body') {
        step = 'quit'
        cmd('QUIT')

      } else if (step === 'quit') {
        clearTimeout(timer)
        conn.destroy()
        done(null)
      }
    }

    // Buffer incoming data and dispatch complete response lines
    const onData = (chunk) => {
      buf += chunk.toString()
      let nl
      while ((nl = buf.indexOf('\n')) !== -1) {
        const line = buf.slice(0, nl + 1).trimEnd()
        buf = buf.slice(nl + 1)
        // Multi-line responses use "NNN-text"; final line uses "NNN text" (space).
        // Only process the final line.
        if (/^\d{3} /.test(line)) {
          onResponse(parseInt(line.slice(0, 3)), line.slice(4))
        }
      }
    }

    sock = net.createConnection({ host, port }, () => {
      conn = sock
      sock.on('data', onData)
    })
    sock.on('error', (err) => { clearTimeout(timer); done(err) })
  })
}

// ── Constants ──────────────────────────────────────────────────────────────────

const FROM    = process.env.SMTP_FROM ?? 'Token Quest <noreply@zerotokens.ai>'
const APP_URL = process.env.APP_URL   ?? 'https://www.zerotokens.ai'

// ── Exported senders ──────────────────────────────────────────────────────────

/**
 * Company employee invitation email.
 */
export async function sendInvitationEmail({ to, username, companyName, verifyToken }) {
  const link = `${APP_URL}/verify?token=${verifyToken}`
  await smtpSend({
    from: FROM, to,
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
    text: `Hi ${username},\n\n${companyName} has invited you to Token Quest.\n\nAccept your invitation: ${link}\n\nThis link expires in 7 days.\n\nToken Quest · ZeroTokens.ai`,
  })
}

/**
 * Individual user email verification email.
 */
export async function sendVerificationEmail({ to, username, verifyToken }) {
  const link = `${APP_URL}/verify?token=${verifyToken}`
  await smtpSend({
    from: FROM, to,
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
    text: `Hi ${username},\n\nVerify your Token Quest email: ${link}\n\nThis link expires in 24 hours.\n\nToken Quest · ZeroTokens.ai`,
  })
}

/**
 * Password reset email.
 */
export async function sendPasswordResetEmail({ to, username, resetToken }) {
  const link = `${APP_URL}/verify?token=${resetToken}&mode=reset`
  await smtpSend({
    from: FROM, to,
    subject: 'Reset your Token Quest password',
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
    text: `Hi ${username},\n\nReset your Token Quest password: ${link}\n\nExpires in 1 hour.\n\nToken Quest · ZeroTokens.ai`,
  })
}
