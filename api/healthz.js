// Minimal Node.js function — zero imports — to confirm Lambda works at all
export default async function handler(request) {
  return new Response(JSON.stringify({
    ok:  true,
    db:  !!process.env.DATABASE_URL,
    env: process.env.VERCEL_ENV ?? 'unknown',
  }), {
    status:  200,
    headers: { 'Content-Type': 'application/json' },
  })
}
