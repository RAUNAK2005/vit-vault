import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './lib/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import GalleryPage from './pages/GalleryPage'
import EventDetailPage from './pages/EventDetailPage'

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center text-white">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

// Public-only Route Wrapper (Redirect to gallery if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center text-white">Loading...</div>
  if (user) return <Navigate to="/gallery" replace />
  return children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            
            <Route path="/gallery" element={
              <ProtectedRoute>
                <GalleryPage />
              </ProtectedRoute>
            } />
            
            <Route path="/event/:id" element={
              <ProtectedRoute>
                <EventDetailPage />
              </ProtectedRoute>
            } />
          </Routes>
        </AnimatePresence>
      </Router>
    </AuthProvider>
  )
}

export default App
