// Step-by-step import diagnostic
let step = 'start'
try {
  await import('../_db.js'); step = '_db ok'
  await import('../_auth.js'); step = '_auth ok'
  await import('../_email.js'); step = '_email ok'
} catch(e) {
  step = `FAILED at ${step}: ${e.message}`
}

export default async function handler(req, res) {
  res.status(200).json({ step })
}
