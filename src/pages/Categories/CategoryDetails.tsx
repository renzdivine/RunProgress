import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Footprints, Route, Gauge, Clock, Zap, Activity, Trash2, ArrowUpDown } from 'lucide-react'
import { getCategoryStats, deleteRun, getRunsByCategory } from '../../services/strava'
import { formatPace, formatTime, formatDate } from '../../utils/format'
import '../Activities/Activities.css'

export default function CategoryDetails() {
  const { distance } = useParams<{ distance: string }>()
  const navigate = useNavigate()
  const km = Number(distance)
  const [deleted, setDeleted] = useState<Set<string>>(new Set())
  const [sortMode, setSortMode] = useState<'date' | 'fastest' | 'slowest'>('date')

  if (!km || isNaN(km)) {
    return (
      <div className="detail-page">
        <p className="detail-not-found">Category not found.</p>
      </div>
    )
  }

  const stats = getCategoryStats(km)
  const runs = getRunsByCategory(km).filter(r => !deleted.has(r.id))

  const sortedRuns = [...runs].sort((a, b) => {
    if (sortMode === 'fastest') return a.time / a.distance - b.time / b.distance
    if (sortMode === 'slowest') return b.time / b.distance - a.time / a.distance
    return 0
  })

  const handleDelete = (id: string) => {
    deleteRun(id)
    setDeleted(prev => new Set(prev).add(id))
  }

  const metrics = [
    { icon: Footprints, label: 'Total Runs', value: String(stats.totalRuns), unit: '' },
    { icon: Route, label: 'Total Distance', value: stats.totalDistance.toFixed(2), unit: 'km' },
    { icon: Gauge, label: 'Avg Pace', value: stats.totalRuns > 0 ? formatPace(stats.avgPace) : '--:-- /km', unit: '' },
    { icon: Clock, label: 'Avg Time', value: stats.totalRuns > 0 ? formatTime(stats.avgTime) : '--m', unit: '' },
    { icon: Zap, label: 'Best Time', value: stats.bestTime > 0 ? formatTime(stats.bestTime) : '--', unit: '' },
  ]

  return (
    <div className="detail-page">
      <button className="detail-back" onClick={() => navigate('/categories')}>
        <ArrowLeft size={16} />
        Categories
      </button>

      <div className="detail-hero">
        <div className="detail-hero-icon">
          <Activity size={32} />
        </div>
        <h1 className="detail-title">{km} KM</h1>
        <span className="detail-date">{stats.totalRuns} {stats.totalRuns === 1 ? 'run' : 'runs'} total</span>
      </div>

      <div className="detail-metrics">
        {metrics.map(m => {
          const MIcon = m.icon
          return (
            <div key={m.label} className="detail-metric">
              <MIcon size={20} />
              <span className="detail-metric-label">{m.label}</span>
              <span className="detail-metric-value">
                {m.value}{m.unit && <span className="metric-unit"> {m.unit}</span>}
              </span>
            </div>
          )
        })}
      </div>

      <div className="detail-section">
        <div className="detail-section-title">
          <Activity size={18} />
          <span>All {km}K Runs</span>
          <button
            className="btn-sort"
            onClick={() => setSortMode(m => m === 'date' ? 'fastest' : m === 'fastest' ? 'slowest' : 'date')}
            title={
              sortMode === 'date' ? 'Sorted by date' :
              sortMode === 'fastest' ? 'Fastest first' : 'Slowest first'
            }
          >
            <ArrowUpDown size={14} />
            {sortMode === 'date' ? 'Date' : sortMode === 'fastest' ? 'Fast' : 'Slow'}
          </button>
        </div>
        {sortedRuns.length === 0 ? (
          <p className="empty-state" style={{ textAlign: 'center', padding: '2rem 0', color: 'rgba(255,255,255,0.4)' }}>
            No runs in this category.
          </p>
        ) : (
          <div className="activities-list">
            {sortedRuns.map(r => (
              <div key={r.id} className="activity-row" style={{ cursor: 'pointer' }} onClick={() => r.stravaUrl ? window.open(r.stravaUrl, '_blank') : navigate(`/activities/${r.id}`)}>
                <div className="activity-main">
                  <span className="activity-name">{r.name}</span>
                  <span className="activity-date">{formatDate(r.date)}</span>
                </div>
                <div className="activity-stats">
                  <span className="activity-stat">{r.distance.toFixed(2)} km</span>
                  <span className="activity-stat">{formatTime(r.time)}</span>
                  <span className="activity-stat">{formatPace(r.time / r.distance)}</span>
                </div>
                <button className="btn-delete" onClick={e => { e.stopPropagation(); handleDelete(r.id) }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
