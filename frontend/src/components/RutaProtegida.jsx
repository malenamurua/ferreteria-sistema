import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RutaProtegida({ children, soloAdmin = false }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (soloAdmin && user.rol !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return children
}
