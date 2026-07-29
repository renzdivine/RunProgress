export interface Split {
  km: number
  time: number
}

export interface Run {
  id: string
  name: string
  distance: number
  time: number
  date: string
  elevation?: number
  splits?: Split[]
  stravaUrl?: string
  stravaId?: number
}

export interface RunStats {
  totalRuns: number
  totalDistance: number
  avgPace: number
  avgTime: number
  recentRuns: Run[]
}

export interface CategoryStats {
  totalRuns: number
  totalDistance: number
  avgPace: number
  avgTime: number
  bestTime: number
  runs: Run[]
}

export function login(): void {
  localStorage.setItem('runprogress_logged_in', 'true')
}

export function isAuthenticated(): boolean {
  return localStorage.getItem('runprogress_logged_in') === 'true'
}

export function logout(): void {
  localStorage.removeItem('runprogress_logged_in')
}

export function getRuns(): Run[] {
  const data = localStorage.getItem('runprogress_runs')
  let runs: Run[] = data ? JSON.parse(data) : []

  // --- Deduplicate: by ID, then by content (name+distance+date or stravaId) ---
  let needsResave = false
  const seenIds = new Set<string>()
  const seenContent = new Set<string>()
  const usedIds = new Set<string>()

  runs = runs.reduce<Run[]>((acc, r) => {
    // Fix duplicate IDs
    let id = r.id
    if (seenIds.has(id)) {
      id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      needsResave = true
    }
    while (usedIds.has(id)) {
      id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    }
    seenIds.add(r.id)
    usedIds.add(id)

    // Skip content-level duplicates (same stravaId OR same name+distance+date)
    const contentKey = r.stravaId != null
      ? `s:${r.stravaId}`
      : `${r.name}|${r.distance}|${r.date}`
    if (seenContent.has(contentKey)) {
      needsResave = true
      return acc
    }
    seenContent.add(contentKey)
    acc.push({ ...r, id })
    return acc
  }, [])

  if (needsResave) {
    localStorage.setItem('runprogress_runs', JSON.stringify(runs))
  }

  return runs.map(r => enrichRun(r)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function enrichRun(run: Run): Run {
  if (run.elevation === undefined) {
    run.elevation = Math.round((run.distance * 10 + Math.random() * 50) * 10) / 10
  }
  if (!run.splits) {
    const pace = run.distance > 0 ? run.time / run.distance : 5
    const kmCount = Math.ceil(run.distance)
    run.splits = Array.from({ length: kmCount }, (_, i) => ({
      km: i + 1,
      time: i < run.distance ? pace : pace * (run.distance - i)
    }))
  }
  return run
}

export function addRun(run: Omit<Run, 'id'>): Run[] {
  const runs = getRuns()
  const duplicate = runs.some(
    r => (run.stravaId !== undefined && r.stravaId === run.stravaId) ||
         (r.name === run.name && r.distance === run.distance && r.date === run.date)
  )
  if (duplicate) return runs
  const newRun: Run = { ...run, id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}` }
  runs.unshift(enrichRun(newRun))
  localStorage.setItem('runprogress_runs', JSON.stringify(runs))
  return runs
}

function uniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function deduplicateRuns(): void {
  const runs = getRuns()
  const seen = new Set<string>()
  const usedIds = new Set<string>()
  const unique: Run[] = []
  for (const r of runs) {
    const key = r.stravaId ? `s:${r.stravaId}` : `${r.name}|${r.distance}|${r.date}`
    if (seen.has(key)) continue
    seen.add(key)
    let id = r.id
    while (usedIds.has(id)) {
      id = uniqueId()
    }
    usedIds.add(id)
    unique.push({ ...r, id })
  }
  localStorage.setItem('runprogress_runs', JSON.stringify(unique))
}

export interface DeleteRecord {
  run: Run
  deletedAt: string
}

export function getDeleteHistory(): DeleteRecord[] {
  const data = localStorage.getItem('runprogress_delete_history')
  return data ? JSON.parse(data) : []
}

export function deleteRun(id: string): Run[] {
  const runs = getRuns()
  const deleted = runs.find(r => r.id === id)
  if (deleted) {
    const history = getDeleteHistory()
    history.unshift({ run: deleted, deletedAt: new Date().toISOString() })
    localStorage.setItem('runprogress_delete_history', JSON.stringify(history.slice(0, 50)))
  }
  const remaining = runs.filter(r => r.id !== id)
  localStorage.setItem('runprogress_runs', JSON.stringify(remaining))
  return remaining
}

export function undoDelete(deletedAt: string): Run[] {
  const history = getDeleteHistory()
  const record = history.find(h => h.deletedAt === deletedAt)
  if (!record) return getRuns()
  addRun(record.run)
  localStorage.setItem('runprogress_delete_history', JSON.stringify(history.filter(h => h.deletedAt !== deletedAt)))
  return getRuns()
}

export function clearDeleteHistory(): void {
  localStorage.removeItem('runprogress_delete_history')
}

export function getStats(): RunStats {
  const runs = getRuns()
  const totalRuns = runs.length
  const totalDistance = runs.reduce((sum, r) => sum + r.distance, 0)
  const totalTime = runs.reduce((sum, r) => sum + r.time, 0)
  const avgPace = totalDistance > 0 ? totalTime / totalDistance : 0
  const avgTime = totalRuns > 0 ? totalTime / totalRuns : 0

  return { totalRuns, totalDistance, avgPace, avgTime, recentRuns: runs }
}

export function getRunById(id: string): Run | undefined {
  return getRuns().find(r => r.id === id)
}

export function getCategoryForDistance(distance: number): number {
  return Math.floor(distance)
}

export function getRunsByCategory(categoryKm: number): Run[] {
  return getRuns().filter(r => getCategoryForDistance(r.distance) === categoryKm)
}

export function getUniqueCategories(): number[] {
  const runs = getRuns()
  const distances = runs.map(r => Math.floor(r.distance))
  return [...new Set(distances)].sort((a, b) => a - b)
}

export function getCategoryStats(categoryKm: number): CategoryStats {
  const runs = getRunsByCategory(categoryKm)
  const totalRuns = runs.length
  const totalDistance = runs.reduce((sum, r) => sum + r.distance, 0)
  const totalTime = runs.reduce((sum, r) => sum + r.time, 0)
  const avgPace = totalDistance > 0 ? totalTime / totalDistance : 0
  const avgTime = totalRuns > 0 ? totalTime / totalRuns : 0
  const bestTime = runs.length > 0 ? Math.min(...runs.map(r => r.time)) : 0

  return { totalRuns, totalDistance, avgPace, avgTime, bestTime, runs }
}
