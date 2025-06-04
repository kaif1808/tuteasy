import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './stores/authStore'

// Auth components
import LoginPage from './components/features/auth/pages/LoginPage'
import RegisterPage from './components/features/auth/pages/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './components/Dashboard'

// Landing page component (original content)
import LandingPage from './components/LandingPage'

function App() {
  const { initializeAuth } = useAuth()

  useEffect(() => {
    // Initialize auth state when app loads
    initializeAuth()
  }, [initializeAuth])

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
