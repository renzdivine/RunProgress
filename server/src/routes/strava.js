import { Router } from 'express';
import { CLIENT_ID, CLIENT_SECRET } from '../config.js';
import { getAuthUrl, exchangeCode, getActivity, getAllActivities } from '../services/strava.js';
import { saveToken, getLatestToken, saveActivities, getAllStoredActivities, getActivityByStravaId } from '../db.js';

const router = Router();

let frontendOrigin = 'http://localhost:5173';

router.get('/url', (req, res) => {
  const origin = req.headers.origin || req.headers.referer;
  if (origin) {
    try { frontendOrigin = new URL(origin).origin; } catch { /* ignore */ }
  }
  const redirectUri = `${frontendOrigin}/api/auth/callback`;
  res.json({ url: getAuthUrl(CLIENT_ID, redirectUri) });
});

router.get('/auth/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error) return res.redirect(`${frontendOrigin}/dashboard?strava_auth=error`);

  try {
    const data = await exchangeCode(CLIENT_ID, CLIENT_SECRET, code);
    saveToken(data.access_token, data.athlete?.id || '');
    const athleteId = data.athlete?.id || '';
    res.redirect(`${frontendOrigin}/dashboard?strava_auth=success&token=${data.access_token}&athlete=${athleteId}`);
  } catch {
    res.redirect(`${frontendOrigin}/dashboard?strava_auth=error`);
  }
});

router.get('/activities/:id', async (req, res) => {
  const cached = getActivityByStravaId(parseInt(req.params.id));
  if (cached) return res.json({ success: true, data: cached, cached: true });

  const token = getLatestToken();
  if (!token) return res.status(401).json({ error: 'Not connected to Strava' });

  try {
    const activity = await getActivity(token.access_token, req.params.id);
    const data = {
      stravaId: activity.id,
      name: activity.name,
      distance: Math.round((activity.distance / 1000) * 100) / 100,
      time: Math.round((activity.moving_time / 60) * 100) / 100,
      date: activity.start_date?.split('T')[0],
    };
    saveActivities([data]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/parse', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const match = url.match(/strava\.com\/activities\/(\d+)/i);
  if (!match) return res.status(400).json({ error: 'Invalid Strava activity URL' });

  const activityId = parseInt(match[1]);

  const cached = getActivityByStravaId(activityId);
  if (cached) return res.json({ success: true, data: cached, cached: true });

  const token = getLatestToken();
  if (!token) return res.status(401).json({ error: 'Not connected to Strava. Click "Connect Strava" first.' });

  try {
    const activity = await getActivity(token.access_token, activityId);
    const data = {
      stravaId: activity.id,
      name: activity.name,
      distance: Math.round((activity.distance / 1000) * 100) / 100,
      time: Math.round((activity.moving_time / 60) * 100) / 100,
      date: activity.start_date?.split('T')[0],
    };
    saveActivities([data]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/import', async (_req, res) => {
  const token = getLatestToken();
  if (!token) return res.status(401).json({ error: 'Not connected to Strava' });

  try {
    const activities = await getAllActivities(token.access_token);
    saveActivities(activities);
    res.json({ success: true, count: activities.length, activities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stored', (_req, res) => {
  const activities = getAllStoredActivities();
  res.json({ success: true, activities });
});

export default router;
