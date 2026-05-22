// Minimal Node.js function — classic (req, res) style
export default async function handler(req, res) {
  res.status(200).json({
    ok:  true,
    db:  !!process.env.DATABASE_URL,
    env: process.env.VERCEL_ENV ?? 'unknown',
  })
}
