import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/admin/adminDashboard.css'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState(null)
  const [recentRides, setRecentRides] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
    fetchRecentRides()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('http://localhost:3000/admin/analytics', {
        credentials: 'include'
      })

      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const fetchRecentRides = async () => {
    try {
      setLoading(true)
      const res = await fetch('http://localhost:3000/admin/allRides?limit=5', {
        credentials: 'include'
      })

      if (res.ok) {
        const data = await res.json()
        setRecentRides(data.slice(0, 5))
      }
    } catch (error) {
      console.error('Error fetching rides:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && !analytics) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="dashboard-header">
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card users">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <p className="stat-label">Total Users</p>
              <h2 className="stat-value">{analytics?.totalUsers || 0}</h2>
              <span className="stat-change positive">Active riders</span>
            </div>
          </div>

          <div className="stat-card drivers">
            <div className="stat-icon">🚗</div>
            <div className="stat-content">
              <p className="stat-label">Total Drivers</p>
              <h2 className="stat-value">{analytics?.totalDrivers || 0}</h2>
              <span className="stat-change positive">Verified drivers</span>
            </div>
          </div>

          <div className="stat-card rides">
            <div className="stat-icon">📍</div>
            <div className="stat-content">
              <p className="stat-label">Total Rides</p>
              <h2 className="stat-value">{analytics?.totalRides || 0}</h2>
              <span className="stat-change">
                {analytics?.completedRides || 0} completed
              </span>
            </div>
          </div>

          <div className="stat-card revenue">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <p className="stat-label">Total Revenue</p>
              <h2 className="stat-value">₹{analytics?.totalEarnings?.toFixed(2) || '0.00'}</h2>
              <span className="stat-change positive">Platform earnings</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => navigate('/admin/users')}>
              <span className="action-icon">👥</span>
              <span>Manage Users</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/admin/drivers')}>
              <span className="action-icon">🚗</span>
              <span>Manage Drivers</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/admin/rides')}>
              <span className="action-icon">📋</span>
              <span>View Rides</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/admin/analytics')}>
              <span className="action-icon">📊</span>
              <span>Analytics</span>
            </button>
          </div>
        </div>

        {/* Recent Rides */}
        <div className="recent-rides">
          <div className="section-header">
            <h3>Recent Rides</h3>
            <button className="view-all-btn" onClick={() => navigate('/admin/rides')}>
              View All →
            </button>
          </div>

          {recentRides.length === 0 ? (
            <div className="empty-state">
              <p>No recent rides</p>
            </div>
          ) : (
            <div className="rides-table">
              <table>
                <thead>
                  <tr>
                    <th>Rider</th>
                    <th>Driver</th>
                    <th>Route</th>
                    <th>Fare</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRides.map((ride) => (
                    <tr key={ride._id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {ride.rider?.firstName?.charAt(0)}
                          </div>
                          <span>{ride.rider?.firstName} {ride.rider?.lastName}</span>
                        </div>
                      </td>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar driver">
                            {ride.driver?.firstName?.charAt(0)}
                          </div>
                          <span>{ride.driver?.firstName} {ride.driver?.lastName}</span>
                        </div>
                      </td>
                      <td>
                        <div className="route-cell">
                          <span className="route-text">{ride.pickupLocation}</span>
                          <span className="route-arrow">→</span>
                          <span className="route-text">{ride.dropLocation}</span>
                        </div>
                      </td>
                      <td>₹{ride.estimatedFare}</td>
                      <td>
                        <span className={`status-badge ${ride.status}`}>
                          {ride.status}
                        </span>
                      </td>
                      <td>{formatDate(ride.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Performance Overview */}
        <div className="performance-grid">
          <div className="performance-card">
            <h4>Completion Rate</h4>
            <div className="performance-value">
              {analytics?.totalRides > 0
                ? ((analytics.completedRides / analytics.totalRides) * 100).toFixed(1)
                : 0} %
            </div>
            <div className="performance-bar">
              <div 
                className="performance-fill"
                style={{ 
                  width: `${analytics?.totalRides > 0 
                    ? (analytics.completedRides / analytics.totalRides) * 100 
                    : 0}%` 
                }}
              ></div>
            </div>
          </div>

          <div className="performance-card">
            <h4>Average Fare</h4>
            <div className="performance-value">
              ₹ {analytics?.completedRides > 0
                ? (analytics.totalEarnings / analytics.completedRides).toFixed(2)
                : '0.00'}
            </div>
            <p className="performance-desc">Per completed ride</p>
          </div>

          <div className="performance-card">
            <h4>Active Ratio</h4>
            <div className="performance-value">
              {analytics?.totalDrivers > 0
                ? ((analytics.totalDrivers / (analytics.totalDrivers + analytics.totalUsers)) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="performance-desc">Drivers to total users</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard