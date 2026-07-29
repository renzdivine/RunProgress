export function formatPace(minutes: number): string {
  const min = Math.floor(minutes)
  const sec = Math.round((minutes - min) * 60)
  return `${min}:${sec.toString().padStart(2, '0')} /km`
}

export function formatTime(minutes: number): string {
  const totalSec = Math.round(minutes * 60)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${m}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
