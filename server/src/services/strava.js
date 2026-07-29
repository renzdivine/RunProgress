const BASE = 'https://www.strava.com/api/v3';

export function getAuthUrl(clientId, redirectUri) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'read,activity:read',
  });
  return `https://www.strava.com/oauth/authorize?${params}`;
}

export async function exchangeCode(clientId, clientSecret, code) {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${text}`);
  }
  return res.json();
}

export async function getActivity(accessToken, activityId) {
  const res = await fetch(`${BASE}/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch activity: ${text}`);
  }
  return res.json();
}

export async function getAllActivities(accessToken) {
  const all = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const res = await fetch(`${BASE}/athlete/activities?per_page=${perPage}&page=${page}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error('Failed to fetch activities');
    const batch = await res.json();
    if (!batch.length) break;
    all.push(...batch);
    page++;
  }

  return all.map(a => ({
    stravaId: a.id,
    name: a.name,
    distance: Math.round((a.distance / 1000) * 100) / 100,
    time: Math.round((a.moving_time / 60) * 100) / 100,
    date: a.start_date?.split('T')[0],
  }));
}
