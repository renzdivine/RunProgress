const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export interface ParsedActivity {
  name: string
  distance: number
  time: number
  date: string
  stravaId: number
}

export function getStravaAuthUrl(): Promise<string> {
  return fetch(`${API_BASE_URL}/api/url`)
    .then(r => {
      const contentType = r.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        throw new Error('API server is not reachable. Please start the backend server.')
      }
      return r.json()
    })
    .then(d => d.url as string)
}

export async function parseStravaUrl(url: string): Promise<ParsedActivity> {
  const res = await fetch(`${API_BASE_URL}/api/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  const json = await res.json()
  if (!res.ok || !json.success) throw new Error(json.error || 'Failed to parse activity')
  return json.data
}

export async function importAllActivities(): Promise<ParsedActivity[]> {
  const res = await fetch(`${API_BASE_URL}/api/import`, { method: 'POST' })
  const json = await res.json()
  if (!res.ok || !json.success) throw new Error(json.error || 'Failed to import activities')
  return json.activities as ParsedActivity[]
}

export async function getStoredActivities(): Promise<ParsedActivity[]> {
  const res = await fetch(`${API_BASE_URL}/api/stored`)
  const json = await res.json()
  if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch stored activities')
  return json.activities as ParsedActivity[]
}

