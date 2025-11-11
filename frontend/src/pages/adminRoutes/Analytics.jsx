import { useEffect, useState } from "react"
import "../../styles/admin/analytics.css"

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [earnings, setEarnings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [analyticsRes, earningsRes] = await Promise.all([
        fetch('http://localhost:3000/admin/analytics', { credentials: 'include' }),
        fetch('http://localhost:3000/admin/earnings', { credentials: 'include' })
      ])

      if (analyticsRes.ok) {
        const data = await analyticsRes.json()
        setAnalytics(data)
      }

      if (earningsRes.ok) {
        const data = await earningsRes.json()
        setEarnings(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="manage-loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="analytics-page">
      <div className="manage-container">
        <div className="manage-header">
          <div>
            <h1>Analytics & Reports</h1>
            <p>Comprehensive platform statistics</p>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Platform Overview</h3>
            <div className="overview-stats">
              <div className="overview-stat">
                <div className="stat-icon blue">👥</div>
                <div>
                  <div className="stat-number">{analytics?.totalUsers || 0}</div>
                  <div className="stat-label">Total Users</div>
                </div>
              </div>
              <div className="overview-stat">
                <div className="stat-icon orange">🚗</div>
                <div>
                  <div className="stat-number">{analytics?.totalDrivers || 0}</div>
                  <div className="stat-label">Total Drivers</div>
                </div>
              </div>
              <div className="overview-stat">
                <div className="stat-icon green">📍</div>
                <div>
                  <div className="stat-number">{analytics?.totalRides || 0}</div>
                  <div className="stat-label">Total Rides</div>
                </div>
              </div>
              <div className="overview-stat">
                <div className="stat-icon purple">💰</div>
                <div>
                  <div className="stat-number">₹{analytics?.totalEarnings?.toFixed(2) || '0.00'}</div>
                  <div className="stat-label">Total Revenue</div>
                </div>
              </div>
            </div>
          </div>

          <div className="analytics-card">
            <h3>Performance Metrics</h3>
            <div className="metrics-list">
              <div className="metric-item">
                <span className="metric-label">Completion Rate</span>
                <div className="metric-bar">
                  <div 
                    className="metric-fill"
                    style={{ 
                      width: `${analytics?.totalRides > 0 
                        ? (analytics.completedRides / analytics.totalRides) * 100 
                        : 0}%` 
                    }}
                  />
                </div>
                <span className="metric-value">
                  {analytics?.totalRides > 0 
                    ? ((analytics.completedRides / analytics.totalRides) * 100).toFixed(1) 
                    : 0}%
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Average Fare</span>
                <span className="metric-value">
                  ₹{analytics?.completedRides > 0 
                    ? (analytics.totalEarnings / analytics.completedRides).toFixed(2) 
                    : '0.00'}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Completed Rides</span>
                <span className="metric-value">{analytics?.completedRides || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-card full-width">
          <h3>Top Performing Drivers</h3>
          {earnings.length === 0 ? (
            <p className="no-data">No earnings data available</p>
          ) : (
            <div className="drivers-leaderboard">
              {earnings.slice(0, 10).map((driver, index) => (
                <div key={driver._id} className="leaderboard-item">
                  <span className="rank">#{index + 1}</span>
                  <span className="driver-name">{driver.driverName}</span>
                  <div className="driver-stats">
                    <span className="rides">{driver.rideCounts} rides</span>
                    <span className="earnings">₹{driver.totalEarned.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Analytics