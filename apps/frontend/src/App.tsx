import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Notes from './pages/Notes'
import NoteDetail from './pages/NoteDetail'
import GraphView from './pages/GraphView'
import ChatBot from './pages/ChatBot'
import Integrations from './pages/Integrations'
import Layout from './components/Layout'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
      <Route path="/reset-password" element={!user ? <ResetPassword /> : <Navigate to="/" />} />
      <Route
        path="/"
        element={user ? <Layout /> : <Navigate to="/login" />}
      >
        <Route index element={<Dashboard />} />
        <Route path="notes" element={<Notes />} />
        <Route path="notes/:id" element={<NoteDetail />} />
        <Route path="graph" element={<GraphView />} />
        <Route path="chat" element={<ChatBot />} />
        <Route path="integrations" element={<Integrations />} />
      </Route>
    </Routes>
  )
}

export default App


