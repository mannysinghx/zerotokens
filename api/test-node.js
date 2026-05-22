// Temporary diagnostic — DELETE after testing
// Node.js runtime (no edge config)
export default async function handler(request) {
  return new Response(JSON.stringify({ ok: true, runtime: 'nodejs', env_has_db: !!process.env.DATABASE_URL }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
