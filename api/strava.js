export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { access_token, refresh_token, mode, activity_id } = req.query;
  if (!access_token) return res.status(400).json({ error: 'No access token' });

  let token = access_token;

  // Refresh token
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

  const headers = { Authorization: 'Bearer ' + token };

  // Mode: streams — fetch detailed activity streams (HR, power, cadence, elevation, speed)
  if (mode === 'streams' && activity_id) {
    try {
      const keys = 'heartrate,watts,cadence,altitude,velocity_smooth,temp,distance,time';
      const r = await fetch(
        `https://www.strava.com/api/v3/activities/${activity_id}/streams?keys=${keys}&key_by_type=true`,
        { headers }
      );
      const data = await r.json();
      return res.status(r.ok ? 200 : 500).json(data);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // Mode: activity — fetch single activity detail with segments
  if (mode === 'activity' && activity_id) {
    try {
      const r = await fetch(
        `https://www.strava.com/api/v3/activities/${activity_id}`,
        { headers }
      );
      const data = await r.json();
      return res.status(r.ok ? 200 : 500).json(data);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // Default: fetch last 60 activities (4 weeks of data for coach)
  try {
    const r = await fetch(
      'https://www.strava.com/api/v3/athlete/activities?per_page=60',
      { headers }
    );
    const data = await r.json();
    return res.status(r.ok ? 200 : 500).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
