import { useNavigate } from 'react-router-dom'
import { Route, ArrowRight } from 'lucide-react'
import { getRunsByCategory, getUniqueCategories } from '../../services/strava'
import './Categories.css'

const icons = [Route]

export default function Categories() {
  const navigate = useNavigate()
  const activeCategories = getUniqueCategories()

  return (
    <div className="categories-page">
      <div className="categories-header">
        <h1>Categories</h1>
        <p>Browse your runs by distance category.</p>
      </div>

      {activeCategories.length === 0 ? (
        <p className="empty-state">No runs yet. Start running to see categories here.</p>
      ) : (
        <div className="categories-grid">
          {activeCategories.map(km => {
            const runs = getRunsByCategory(km)
            const Icon = icons[0]
            return (
              <button key={km} className="category-card" onClick={() => navigate(`/categories/${km}`)}>
                <div className="category-card-icon">
                  <Icon size={28} />
                </div>
                <span className="category-card-km">{km} KM</span>
                <span className="category-card-count">
                  {runs.length} {runs.length === 1 ? 'run' : 'runs'}
                </span>
                <ArrowRight size={16} className="category-card-arrow" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
