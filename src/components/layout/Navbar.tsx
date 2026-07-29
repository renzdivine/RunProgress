import { Activity, X, LayoutDashboard, List, Grid3X3, LogOut } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { isAuthenticated, logout } from '../../services/strava'
import { getStravaAuthUrl } from '../../services/api'

const authedLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/activities', label: 'Activities', icon: List },
  { to: '/categories', label: 'Categories', icon: Grid3X3 },
]

export default function Navbar() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const location = useLocation()
  const authed = isAuthenticated()

  return (
    <>
      <nav className="navbar navbar--glass">
        <div className="navbar-inner">
          <div className="navbar-left">
            <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
              <Activity size={24} />
              <span>RunProgress</span>
            </Link>
          </div>

          <div className={`navbar-center ${menuOpen ? 'open' : ''}`}>
            {authed ? (
              authedLinks.map(link => {
                const Icon = link.icon
                const active = location.pathname.startsWith(link.to)
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`navbar-link ${active ? 'navbar-link--active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Icon size={16} />
                    {link.label}
                  </Link>
                )
              })
            ) : (
              <>
                <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
                <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
                <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</a>
              </>
            )}
          </div>

          <div className="navbar-right">
            {authed ? (
              <button className="btn-strava" onClick={() => setShowLogoutConfirm(true)}>Logout</button>
            ) : (
              <button className="btn-strava" onClick={() => { getStravaAuthUrl().then(url => { if (url) window.location.href = url }).catch(() => { alert('Could not connect to the server. Please ensure the API server is running.') }) }}>Login with Strava</button>
            )}
          </div>

          <button
            className="navbar-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <span className="hamburger-icon" />}
          </button>
        </div>
      </nav>

      {authed && (
        <nav className="bottom-nav">
          <div className="bottom-nav-bg" />
          {authedLinks.map(link => {
            const Icon = link.icon
            const active = location.pathname.startsWith(link.to)
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`bottom-nav-item ${active ? 'bottom-nav-item--active' : ''}`}
              >
                <div className="bottom-nav-icon">
                  <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
                  {active && <span className="bottom-nav-dot" />}
                </div>
                <span className="bottom-nav-label">{link.label}</span>
              </Link>
            )
          })}
          <button
            className="bottom-nav-item bottom-nav-item--logout"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <div className="bottom-nav-icon">
              <LogOut size={22} strokeWidth={1.8} />
            </div>
            <span className="bottom-nav-label">Logout</span>
          </button>
        </nav>
      )}

      {showLogoutConfirm && (
        <div className="confirm-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon-wrapper">
              <LogOut size={24} />
            </div>
            <h3>Logout?</h3>
            <p className="confirm-subtext">You'll need to log in again to access your runs.</p>
            <div className="confirm-actions">
              <button className="btn-cancel" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="btn-confirm-logout" onClick={() => { logout(); navigate('/'); }}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
