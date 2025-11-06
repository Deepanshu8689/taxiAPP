import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import '../../styles/riderLayout.css'
import { removeUser } from '../../utils/Redux/userSlice'

const RiderLayout = () => {
  const user = useSelector((store) => store.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      dispatch(removeUser())
      navigate('/')
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <div className="rider-layout">
      {/* Top Navigation */}
      <nav className="top-nav">
        <div className="nav-brand">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M5 17h-.8C3.5 17 3 16.5 3 15.8V13c0-.6.4-1 1-1h1V7c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v5h1c.6 0 1 .4 1 1v2.8c0 .7-.5 1.2-1.2 1.2H19" 
              stroke="#667eea" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="7" cy="17" r="2" stroke="#667eea" strokeWidth="2"/>
            <circle cx="17" cy="17" r="2" stroke="#667eea" strokeWidth="2"/>
          </svg>
          <span>RideEase</span>
        </div>

        <div className="nav-user">
          <div className="user-avatar">
            {user?.firstName?.charAt(0)}
          </div>
          <span className="user-name">{user?.firstName}</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="layout-content">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <NavLink to="/rider/request" className="nav-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>Book</span>
        </NavLink>

        <NavLink to="/rider/history" className="nav-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>History</span>
        </NavLink>

        <NavLink to="/rider/profile" className="nav-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>Profile</span>
        </NavLink>

        <button onClick={handleLogout} className="nav-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Logout</span>
        </button>
      </nav>
    </div>
  )
}

export default RiderLayout