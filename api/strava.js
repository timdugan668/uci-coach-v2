export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { access_token, refresh_token } = req.query;
  if (!access_token) return res.status(400).json({ error: 'No access token provided' });

  let token = access_token;

  // Try refresh if refresh token provided
  if (refresh_token) {
    try {
      const r = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.STRAVA_CLIENT_ID,
          client_secret: process.env.STRAVA_CLIENT_SECRET,
          refresh_token,
          grant_type: 'refresh_token'
        })
      });
      const d = await r.json();
      if (d.access_token) token = d.access_token;
    } catch (e) {}
  }

  try {
    const r = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=20', {
      headers: { Authorization: 'Bearer ' + token }
    });
    const data = await r.json();
    return res.status(r.ok ? 200 : 500).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
