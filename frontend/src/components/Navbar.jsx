import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { isLoggedIn, role, auth, logout } = useAuth()

  const navClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-200'}`

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/courses" className="text-lg font-semibold text-indigo-700">
          Learnova
        </Link>
        <nav className="flex items-center gap-2">
          <NavLink to="/courses" className={navClass}>
            Courses
          </NavLink>
          {isLoggedIn && (
            <NavLink to="/my-courses" className={navClass}>
              My Courses
            </NavLink>
          )}
          {(role === 'ADMIN' || role === 'INSTRUCTOR') && (
            <NavLink to="/admin" className={navClass}>
              Admin
            </NavLink>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <span className="text-sm text-slate-600">{auth?.name}</span>
              <button
                type="button"
                className="rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
                Login
              </Link>
              <Link to="/register" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
