// frontend/pages/api/summarize.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // We'll use a base URL environment variable to be cleaner
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    const backendUrl = `${baseUrl}/summarize`;

    const r = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body), // body should be { text: "..." }
    });
    
    const data = await r.json();

    if (!r.ok) {
      // Forward the error from the backend
      throw new Error(data.detail || 'Failed to summarize');
    }

    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: String(err.message) });
  }
}
