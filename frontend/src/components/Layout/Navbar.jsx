import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Zap, LogOut, Plus, User, Map } from 'lucide-react'
import toast from 'react-hot-toast'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="brand-icon">
          <Zap size={20} fill="currentColor" />
        </div>
        <span className="brand-text">Ethio<span className="brand-accent">Charge</span></span>
      </Link>

      <div className="navbar-center">
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
          <Map size={15} /> Map
        </Link>
        {user && (
          <Link to="/add" className={`nav-link ${isActive('/add') ? 'active' : ''}`}>
            <Plus size={15} /> Add Station
          </Link>
        )}
      </div>

      <div className="navbar-right">
        {user ? (
          <>
            <div className="user-chip">
              <User size={14} />
              <span>{user.username}</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              <LogOut size={14} /> Logout
            </button>
          </>
        ) : (
          <Link to="/auth" className="btn btn-primary btn-sm">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  )
}
