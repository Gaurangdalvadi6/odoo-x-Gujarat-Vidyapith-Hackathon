import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children, roles }) {
  const { isLoggedIn, role } = useAuth()

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  if (roles?.length && !roles.includes(role)) {
    return <Navigate to="/courses" replace />
  }

  return children
}

export default ProtectedRoute
