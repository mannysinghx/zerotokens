/**
 * GET /api/admin/test-smtp
 * Tests SMTP connectivity and auth from the Lambda environment.
 * Returns detailed diagnostic info. Admin-only, temporary debug endpoint.
 */
import * as net from 'node:net'
import * as tls from 'node:tls'

const ALLOWED_ORIGINS = ['https://www.zerotokens.ai', 'https://zerotokens.ai', 'http://localhost:5173', 'http://localhost:3000']

function cors(req, res) {
  const origin = req.headers.origin ?? ''
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS.includes(origin) ? origin : 'https://www.zerotokens.ai')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-password')
  res.setHeader('Vary', 'Origin')
}

function b64(s) { return Buffer.from(String(s)).toString('base64') }

export default async function handler(req, res) {
  cors(req, res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' })

  const host = process.env.SMTP_HOST     ?? 'smtp.gmail.com'
  const port = parseInt(process.env.SMTP_PORT ?? '587')
  const user = (process.env.SMTP_USER    ?? '').trim()
  const pass = (process.env.SMTP_PASSWORD ?? '').replace(/\\n/g, '').replace(/\s/g, '').trim()

  const diag = {
    host, port,
    user,
    passLen:    pass.length,
    passFirst4: pass.slice(0, 4),
    passLast4:  pass.slice(-4),
    passB64:    b64(pass),
  }

  const log = []

  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout after 15s')), 15_000)
      let buf = '', sock, conn, step = 'greeting'
      const cmd = s => { log.push('> ' + s.slice(0, 20)); conn.write(s + '\r\n') }

      const onResponse = (code, msg) => {
        log.push(`< ${code} ${msg.trim().slice(0, 60)}`)
        if (code >= 400) { clearTimeout(timer); return reject(new Error(`SMTP ${code}: ${msg.trim()}`)) }
        if (step === 'greeting') { step = 'ehlo'; cmd(`EHLO localhost`) }
        else if (step === 'ehlo') { step = 'starttls'; cmd('STARTTLS') }
        else if (step === 'starttls') {
          step = 'upgrading'
          sock.removeAllListeners('data')
          const t = tls.connect({ socket: sock, host, servername: host }, () => {
            conn = t; t.on('data', onData); step = 'ehlo2'; cmd('EHLO localhost')
          })
          t.on('error', e => { clearTimeout(timer); reject(e) })
        }
        else if (step === 'ehlo2') { step = 'auth'; cmd('AUTH LOGIN') }
        else if (step === 'auth')  { step = 'user'; cmd(b64(user)) }
        else if (step === 'user')  { step = 'pass'; cmd(b64(pass)) }
        else if (step === 'pass')  { clearTimeout(timer); conn.destroy(); resolve() }
      }

      const onData = chunk => {
        buf += chunk.toString()
        let nl
        while ((nl = buf.indexOf('\n')) !== -1) {
          const line = buf.slice(0, nl+1).trimEnd()
          buf = buf.slice(nl+1)
          if (/^\d{3} /.test(line)) onResponse(parseInt(line.slice(0,3)), line.slice(4))
        }
      }

      sock = net.createConnection({ host, port }, () => { conn = sock; sock.on('data', onData) })
      sock.on('error', e => { clearTimeout(timer); reject(e) })
    })

    return res.status(200).json({ ok: true, diag, log })
  } catch (err) {
    return res.status(200).json({ ok: false, error: err.message, diag, log })
  }
}
