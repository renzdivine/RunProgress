import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import Home from '../pages/Home/Home'
import Dashboard from '../pages/Dashboard/Dashboard'
import Activities from '../pages/Activities/Activities'
import ActivityDetails from '../pages/Activities/ActivityDetails'
import Categories from '../pages/Categories/Categories'
import CategoryDetails from '../pages/Categories/CategoryDetails'
import { isAuthenticated, login } from '../services/strava'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams()
  const stravaAuth = searchParams.get('strava_auth')
  const token = searchParams.get('token')

  if (stravaAuth === 'success' && token) {
    login()
  }

  if (!isAuthenticated()) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activities"
        element={
          <ProtectedRoute>
            <Activities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activities/:id"
        element={
          <ProtectedRoute>
            <ActivityDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories/:distance"
        element={
          <ProtectedRoute>
            <CategoryDetails />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
