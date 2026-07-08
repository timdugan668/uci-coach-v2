export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  let token = process.env.STRAVA_ACCESS_TOKEN;
  try {
    const r = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: process.env.STRAVA_REFRESH_TOKEN,
        grant_type: 'refresh_token'
      })
    });
    const d = await r.json();
    if (d.access_token) token = d.access_token;
  } catch (e) {}
  try {
    const r = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=15', {
      headers: { Authorization: 'Bearer ' + token }
    });
    const data = await r.json();
    return res.status(r.ok ? 200 : 500).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
