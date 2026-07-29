import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowUpDown } from 'lucide-react'
import { getRuns } from '../../services/strava'
import { formatPace, formatTime, formatDate } from '../../utils/format'
import './Activities.css'

type SortKey = 'date' | 'distance' | 'time' | 'name'
type SortDir = 'asc' | 'desc'

export default function Activities() {
  const navigate = useNavigate()
  const [runs] = useState(getRuns())
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const filtered = runs
    .filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'date') return mul * (new Date(a.date).getTime() - new Date(b.date).getTime())
      if (sortKey === 'distance') return mul * (a.distance - b.distance)
      if (sortKey === 'time') return mul * (a.time - b.time)
      return mul * a.name.localeCompare(b.name)
    })

  const totalDistance = runs.reduce((s, r) => s + r.distance, 0)
  const totalTime = runs.reduce((s, r) => s + r.time, 0)

  return (
    <div className="activities-page">
      <div className="activities-header">
        <h1>Activities</h1>
        <span className="activities-count">{runs.length} runs · {totalDistance.toFixed(2)} km · {formatTime(totalTime)}</span>
      </div>

      <div className="activities-toolbar">
        <div className="activities-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search runs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="activities-empty">No runs found.</p>
      ) : (
        <div className="activities-table">
          <div className="activities-table-header">
            <button className="th-name" onClick={() => toggleSort('name')}>
              Name <ArrowUpDown size={12} />
            </button>
            <button className="th-date" onClick={() => toggleSort('date')}>
              Date <ArrowUpDown size={12} />
            </button>
            <button className="th-distance" onClick={() => toggleSort('distance')}>
              Distance <ArrowUpDown size={12} />
            </button>
            <button className="th-time" onClick={() => toggleSort('time')}>
              Time <ArrowUpDown size={12} />
            </button>
            <span className="th-pace">Pace</span>
          </div>
          {filtered.map(r => (
            <div key={r.id} className="activities-row" onClick={() => r.stravaUrl ? window.open(r.stravaUrl, '_blank') : navigate(`/activities/${r.id}`)}>
              <span className="cell-name">{r.name}</span>
              <span className="cell-date">{formatDate(r.date)}</span>
              <span className="cell-distance">{r.distance.toFixed(2)} km</span>
              <span className="cell-time">{formatTime(r.time)}</span>
              <span className="cell-pace">{formatPace(r.time / r.distance)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
