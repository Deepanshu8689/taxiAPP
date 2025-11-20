import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import '../../styles/driver/driverLayout.css'
import { removeUser } from '../../utils/Redux/userSlice'

const DriverLayout = () => {
  const user = useSelector((store) => store.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const isVerified = user?.isVerified === true

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

  const handleNavClick = (e, path) => {
    // If driver is not verified and trying to access restricted pages
    if (!isVerified && path !== '/driver/profile') {
      e.preventDefault()
      alert('Please complete your profile verification to access this feature')
    }
  }

  return (
    <div className="driver-layout">
      {/* Top Navigation */}
      <nav className="top-nav driver-nav">
        <div className="nav-brand">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M5 17h-.8C3.5 17 3 16.5 3 15.8V13c0-.6.4-1 1-1h1V7c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v5h1c.6 0 1 .4 1 1v2.8c0 .7-.5 1.2-1.2 1.2H19"
              stroke="#ffc107" strokeWidth="2" strokeLinecap="round" />
            <circle cx="7" cy="17" r="2" stroke="#ffc107" strokeWidth="2" />
            <circle cx="17" cy="17" r="2" stroke="#ffc107" strokeWidth="2" />
          </svg>
          <span>RideEase Driver</span>
        </div>

        <div className="nav-user">
          <div className="user-avatar driver-avatar">
            {user?.firstName?.charAt(0)}
          </div>
          <span className="user-name">{user?.firstName}</span>
          {!isVerified && (
            <span className="verification-badge pending">Pending</span>
          )}
        </div>
      </nav>

      {/* Verification Alert Banner */}
      {!isVerified && location.pathname === '/driver/profile' && (
        <div className="verification-alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <strong>Profile Verification Required</strong>
            <p>Complete your profile and submit documents to start accepting rides</p>
          </div>
        </div>
      )}

      {!isVerified && location.pathname !== '/driver/profile' && (
        <div className="verification-alert error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div>
            <strong>Access Restricted</strong>
            <p>Complete your profile verification to access this feature</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="layout-content">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav driver-bottom-nav">
        <NavLink 
          to="/driver/home" 
          className={`nav-item ${!isVerified ? 'disabled' : ''}`}
          onClick={(e) => handleNavClick(e, '/driver/home')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Home</span>
          {!isVerified && <span className="lock-icon">🔒</span>}
        </NavLink>

        <NavLink 
          to="/driver/earnings" 
          className={`nav-item ${!isVerified ? 'disabled' : ''}`}
          onClick={(e) => handleNavClick(e, '/driver/earnings')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <span>Earnings</span>
          {!isVerified && <span className="lock-icon">🔒</span>}
        </NavLink>

        <NavLink 
          to="/driver/history" 
          className={`nav-item ${!isVerified ? 'disabled' : ''}`}
          onClick={(e) => handleNavClick(e, '/driver/history')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>History</span>
          {!isVerified && <span className="lock-icon">🔒</span>}
        </NavLink>

        <NavLink to="/driver/profile" className="nav-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Profile</span>
          {!isVerified && <span className="alert-dot"></span>}
        </NavLink>

        <NavLink 
          to="/driver/support" 
          className={`nav-item ${!isVerified ? 'disabled' : ''}`}
          onClick={(e) => handleNavClick(e, '/driver/support')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a10 10 0 0 0-10 10v3a4 4 0 0 0 4 4h1v-6H6a1 1 0 0 1-1-1v-1a7 7 0 0 1 14 0v1a1 1 0 0 1-1 1h-1v6h1a4 4 0 0 0 4-4v-3A10 10 0 0 0 12 1z" />
          </svg>
          <span>Support</span>
          {!isVerified && <span className="lock-icon">🔒</span>}
        </NavLink>

        <button onClick={handleLogout} className="nav-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Logout</span>
        </button>
      </nav>
    </div>
  )
}

export default DriverLayout