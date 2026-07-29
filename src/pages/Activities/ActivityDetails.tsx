import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Route, Gauge, Clock, TrendingUp, Split, ExternalLink } from 'lucide-react'
import { getRunById, type Run } from '../../services/strava'
import { formatPace, formatTime, formatDate } from '../../utils/format'
import './Activities.css'

function SplitsTable({ splits }: { splits: Run['splits'] }) {
  if (!splits || splits.length === 0) return null
  return (
    <div className="detail-section">
      <h3 className="detail-section-title">
        <Split size={18} />
        Splits
      </h3>
      <table className="splits-table">
        <thead>
          <tr>
            <th>km</th>
            <th>Time</th>
            <th>Pace</th>
          </tr>
        </thead>
        <tbody>
          {splits.map(s => (
            <tr key={s.km}>
              <td>{s.km}</td>
              <td>{formatTime(s.time)}</td>
              <td>{formatPace(s.time / 1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ActivityDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const run = id ? getRunById(id) : undefined

  if (!run) {
    return (
      <div className="detail-page">
        <p className="detail-not-found">Activity not found.</p>
      </div>
    )
  }

  return (
    <div className="detail-page">
      <button className="detail-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="detail-hero">
        <h1 className="detail-title">{run.name}</h1>
        <span className="detail-date">{formatDate(run.date)}</span>
      </div>

      <div className="detail-metrics">
        <div className="detail-metric">
          <Route size={20} />
          <span className="detail-metric-label">Distance</span>
          <span className="detail-metric-value">{run.distance.toFixed(2)} km</span>
        </div>
        <div className="detail-metric">
          <Clock size={20} />
          <span className="detail-metric-label">Time</span>
          <span className="detail-metric-value">{formatTime(run.time)}</span>
        </div>
        <div className="detail-metric">
          <Gauge size={20} />
          <span className="detail-metric-label">Avg Pace</span>
          <span className="detail-metric-value">{formatPace(run.time / run.distance)}</span>
        </div>
        <div className="detail-metric">
          <TrendingUp size={20} />
          <span className="detail-metric-label">Elevation</span>
          <span className="detail-metric-value">{run.elevation?.toFixed(0) ?? '—'} m</span>
        </div>
      </div>

      <div className="detail-section">
        <h3 className="detail-section-title">
          <Route size={18} />
          Route Map
        </h3>
        <div className="detail-map-placeholder">
          <span className="detail-map-label">Route visualization coming soon</span>
        </div>
      </div>

      {run.stravaUrl && (
        <div className="detail-section">
          <h3 className="detail-section-title">
            <ExternalLink size={18} />
            Source
          </h3>
          <a href={run.stravaUrl} target="_blank" rel="noopener noreferrer" className="strava-source-link">
            View on Strava <ExternalLink size={14} />
          </a>
        </div>
      )}

      <SplitsTable splits={run.splits} />
    </div>
  )
}
