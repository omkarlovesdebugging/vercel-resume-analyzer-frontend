// Simple proxy API route that forwards requests to the FastAPI backend.
// This keeps the frontend on the same origin and avoids CORS issues.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    const backendUrl = `${baseUrl}/score-resume`;
    const r = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    })
    const data = await r.json()
    res.status(r.status).json(data)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
