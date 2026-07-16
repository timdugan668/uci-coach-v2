export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ error: 'No auth token' });

  const headers = {
    'Content-Type': 'application/json',
    'apikey': supabaseKey,
    'Authorization': authHeader
  };

  if (req.method === 'GET') {
    try {
      const r = await fetch(`${supabaseUrl}/rest/v1/profiles?select=*`, { headers });
      const data = await r.json();
      return res.status(r.ok ? 200 : 500).json(data[0] || null);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const r = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify(req.body)
      });
      const data = await r.json();
      return res.status(r.ok ? 200 : 500).json(data);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
