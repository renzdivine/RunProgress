let token = null
const activities = new Map()

export function saveToken(accessToken, athleteId) {
  token = { access_token: accessToken, athlete_id: athleteId, created_at: new Date().toISOString() }
}

export function getLatestToken() {
  return token
}

export function saveActivities(activitiesList) {
  for (const a of activitiesList) {
    activities.set(a.stravaId, a)
  }
}

export function getAllStoredActivities() {
  return [...activities.values()].sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function getActivityByStravaId(id) {
  return activities.get(id) || null
}
