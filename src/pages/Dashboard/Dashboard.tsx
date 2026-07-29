import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Footprints, Route, Gauge, Clock, Activity, Plus, Trash2, Link, Loader, ExternalLink, ArrowUpDown, History, Undo2 } from 'lucide-react'
import { getStats, addRun, deleteRun, undoDelete, getDeleteHistory, clearDeleteHistory, logout, login, getRuns, deduplicateRuns } from '../../services/strava'
import { getStravaAuthUrl, parseStravaUrl, importAllActivities } from '../../services/api'
import './Dashboard.css'

function formatPace(minutes: number): string {
  const min = Math.floor(minutes)
  const sec = Math.round((minutes - min) * 60)
  return `${min}:${sec.toString().padStart(2, '0')} /km`
}

function formatTime(minutes: number): string {
  const totalSec = Math.round(minutes * 60)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${m}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

function parseTimeInput(value: string): number {
  if (value.includes(':')) {
    const parts = value.split(':')
    const mins = parseFloat(parts[0]) || 0
    const secs = parseFloat(parts[1]) || 0
    return mins + secs / 60
  }
  return parseFloat(value) || 0
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [stats, setStats] = useState(getStats())
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', distance: '', time: '', date: today() })
  const [stravaUrl, setStravaUrl] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState('')
  const [stravaConnected, setStravaConnected] = useState(!!localStorage.getItem('strava_token'))
  const [authMsg, setAuthMsg] = useState('')
  const [sortMode, setSortMode] = useState<'date' | 'fastest' | 'slowest'>('date')
  const [deleteHistory, setDeleteHistory] = useState(getDeleteHistory())
  const [showHistory, setShowHistory] = useState(false)

  const sortedRuns = [...stats.recentRuns].sort((a, b) => {
    if (sortMode === 'fastest') return a.time / a.distance - b.time / b.distance
    if (sortMode === 'slowest') return b.time / b.distance - a.time / a.distance
    return 0
  })

  useEffect(() => {
    deduplicateRuns()
    setStats(getStats())
    const status = searchParams.get('strava_auth')
    const token = searchParams.get('token')
    if (status === 'success' && token) {
      localStorage.setItem('strava_token', token)
      setStravaConnected(true)
      login()
      setAuthMsg('Connected! Importing your activities...')
      importAllActivities()
        .then(activities => {
          deduplicateRuns()
          let count = 0
          activities.forEach(a => {
            const before = getRuns().length
            addRun({ ...a, stravaUrl: `https://www.strava.com/activities/${a.stravaId}` })
            if (getRuns().length > before) count++
          })
          setStats(getStats())
          setAuthMsg(`Imported ${count} new activities from Strava!`)
        })
        .catch(() => setAuthMsg('Connected, but failed to import activities.'))
      const params = new URLSearchParams(searchParams.toString())
      params.delete('strava_auth')
      params.delete('token')
      params.delete('athlete')
      navigate('/dashboard', { replace: true })
    } else if (status === 'error') {
      setAuthMsg('Strava connection failed. Try again.')
      navigate('/dashboard', { replace: true })
    }
  }, [])

  const handleConnect = async () => {
    try {
      const url = await getStravaAuthUrl()
      window.location.href = url
    } catch {
      setAuthMsg('Failed to start Strava connection.')
    }
  }

  const handleParse = async () => {
    if (!stravaUrl.trim()) return
    setParsing(true)
    setParseError('')
    try {
      const data = await parseStravaUrl(stravaUrl.trim())
      setForm({
        name: data.name,
        distance: String(data.distance),
        time: String(data.time),
        date: data.date,
      })
      setShowForm(true)
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Failed to parse activity')
    } finally {
      setParsing(false)
    }
  }

  const [confirmSave, setConfirmSave] = useState(false)
  const [pendingRun, setPendingRun] = useState<{ name: string; distance: number; time: number; date: string; stravaUrl?: string } | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const distance = parseFloat(form.distance)
    const time = parseTimeInput(form.time)
    if (!distance || !time || !form.date) return

    setPendingRun({
      name: form.name || 'Run',
      distance,
      time,
      date: form.date,
      stravaUrl: stravaUrl.trim() || undefined,
    })
    setConfirmSave(true)
  }

  const handleConfirmSave = () => {
    if (!pendingRun) return
    addRun(pendingRun)
    setStats(getStats())
    setForm({ name: '', distance: '', time: '', date: today() })
    setStravaUrl('')
    setShowForm(false)
    setConfirmSave(false)
    setPendingRun(null)
  }

  const handleCancelSave = () => {
    setConfirmSave(false)
    setPendingRun(null)
  }

  const handleDelete = (id: string) => {
    deleteRun(id)
    setStats(getStats())
    setDeleteHistory(getDeleteHistory())
  }

  const handleUndo = (deletedAt: string) => {
    undoDelete(deletedAt)
    setStats(getStats())
    setDeleteHistory(getDeleteHistory())
  }

  const handleClearHistory = () => {
    clearDeleteHistory()
    setDeleteHistory([])
  }

  const metrics = [
    { icon: Footprints, label: 'Total Runs', value: stats.totalRuns.toString(), unit: '' },
    { icon: Route, label: 'Total Distance', value: stats.totalDistance.toFixed(2), unit: 'km' },
    { icon: Gauge, label: 'Average Pace', value: stats.totalRuns > 0 ? formatPace(stats.avgPace) : '--:-- /km', unit: '' },
    { icon: Clock, label: 'Average Time', value: stats.totalRuns > 0 ? formatTime(stats.avgTime) : '--m', unit: '' },
  ]

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="header-actions">
          <button className="btn-add" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} />
            Add Run
          </button>
          <button className="btn-logout" onClick={() => { logout(); navigate('/'); }}>Logout</button>
        </div>
      </div>

      <div className="strava-section">
        {stravaConnected ? (
          <div className="strava-status">
            <span className="strava-status-dot" />
            Connected to Strava
          </div>
        ) : (
          <button className="btn-strava-connect" onClick={handleConnect}>
            <ExternalLink size={16} />
            Connect Strava
          </button>
        )}
      </div>

      {authMsg && <p className="auth-msg">{authMsg}</p>}

      <div className="strava-parse">
        <div className="strava-parse-input">
          <Link size={16} />
          <input
            type="url"
            placeholder="Paste a Strava activity link..."
            value={stravaUrl}
            onChange={e => { setStravaUrl(e.target.value); setParseError('') }}
          />
        </div>
        <button className="btn-parse" onClick={handleParse} disabled={parsing || !stravaUrl.trim()}>
          {parsing ? <Loader size={16} className="spin" /> : 'Import'}
        </button>
      </div>
      {parseError && <p className="parse-error">{parseError}</p>}

      {showForm && (
        <form className="add-run-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Run name (e.g. Morning Run)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Distance (km)"
            value={form.distance}
            onChange={(e) => setForm({ ...form, distance: e.target.value })}
            required
          />
          <input
            type="text"
            inputMode="numeric"
            placeholder="Time (e.g. 27:15 or 27.25)"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            required
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
          {stravaUrl.trim() && (
            <p className="strava-attached">From: {stravaUrl.trim()}</p>
          )}
          <button type="submit" className="btn-save">Save</button>
        </form>
      )}

      {confirmSave && pendingRun && (
        <div className="confirm-overlay" onClick={handleCancelSave}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <h3>Confirm Save</h3>
            <div className="confirm-details">
              <p><strong>{pendingRun.name}</strong></p>
              <p>{pendingRun.date}</p>
              <p>{pendingRun.distance.toFixed(2)} km · {formatTime(pendingRun.time)} · {formatPace(pendingRun.time / pendingRun.distance)}</p>
            </div>
            <div className="confirm-actions">
              <button className="btn-cancel" onClick={handleCancelSave}>Cancel</button>
              <button className="btn-save" onClick={handleConfirmSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="metrics-grid">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <div key={m.label} className="metric-card">
              <div className="metric-icon">
                <Icon size={24} />
              </div>
              <span className="metric-label">{m.label}</span>
              <span className="metric-value">
                {m.value}{m.unit && <span className="metric-unit"> {m.unit}</span>}
              </span>
            </div>
          )
        })}
      </div>

      <section className="recent-section">
        <div className="section-title">
          <Activity size={20} />
          <span>Recent Activities</span>
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
          <p className="empty-state">No runs yet. Click "Add Run" to get started.</p>
        ) : (
          <div className="activities-list">
            {sortedRuns.map((r) => (
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
      </section>

      {deleteHistory.length > 0 && (
        <section className="delete-history-section">
          <button className="history-toggle" onClick={() => setShowHistory(!showHistory)}>
            <History size={18} />
            <span>Deleted ({deleteHistory.length})</span>
          </button>
          {showHistory && (
            <div className="delete-history-list">
              {deleteHistory.map((record) => (
                <div key={record.deletedAt} className="history-row">
                  <div className="history-info">
                    <span className="history-name">{record.run.name}</span>
                    <span className="history-date">{formatDate(record.run.date)} · {record.run.distance.toFixed(2)} km · {formatTime(record.run.time)}</span>
                  </div>
                  <button className="btn-undo" onClick={() => handleUndo(record.deletedAt)}>
                    <Undo2 size={14} />
                    Undo
                  </button>
                </div>
              ))}
              <button className="btn-clear-history" onClick={handleClearHistory}>Clear History</button>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
