import { useEffect, useState } from 'react'
import '../../styles/admin/manageRides.css'

const ManageRides = () => {
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchRides()
  }, [filter])

  const fetchRides = async () => {
    try {
      setLoading(true)
      const url = filter === 'all'
        ? 'http://localhost:3000/admin/allRides'
        : `http://localhost:3000/admin/allRides?status=${filter}`
      
      const res = await fetch(url, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setRides(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching rides:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      completed: '#10b981',
      cancelled: '#ef4444',
      started: '#3b82f6',
      accepted: '#8b5cf6',
      requested: '#f59e0b'
    }
    return colors[status] || '#6b7280'
  }

  if (loading) {
    return (
      <div className="manage-loading">
        <div className="spinner"></div>
        <p>Loading rides...</p>
      </div>
    )
  }

  return (
    <div className="manage-rides">
      <div className="manage-container">
        <div className="manage-header">
          <div>
            <h1>Manage Rides</h1>
            <p>View and monitor all ride activities</p>
          </div>
          <div className="header-stats">
            <div className="stat-pill">
              <span className="stat-number">{rides.length}</span>
              <span className="stat-text">Total Rides</span>
            </div>
          </div>
        </div>

        <div className="filter-tabs">
          {['all', 'completed', 'started','scheduled', 'accepted', 'requested', 'cancelled'].map((status) => (
            <button
              key={status}
              className={`filter-tab ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {rides.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚗</div>
            <h3>No rides found</h3>
            <p>No rides match the current filter</p>
          </div>
        ) : (
          <div className="rides-list">
            {rides.map((ride) => (
              <div key={ride._id} className="ride-card-admin">
                <div className="ride-card-header">
                  <span 
                    className="status-dot"
                    style={{ backgroundColor: getStatusColor(ride.status) }}
                  />
                  <span className="ride-id">#{ride._id.slice(-8)}</span>
                  <span className={`status-badge ${ride.status}`}>
                    {ride.status}
                  </span>
                </div>

                <div className="ride-participants">
                  <div className="participant">
                    <span className="label">Rider:</span>
                    <div className="user-info">
                      <div className="avatar">
                        {ride.rider?.firstName?.charAt(0)}
                      </div>
                      <span>{ride.rider?.firstName} {ride.rider?.lastName}</span>
                    </div>
                  </div>

                  <div className="participant">
                    <span className="label">Driver:</span>
                    <div className="user-info">
                      <div className="avatar driver">
                        {ride.driver?.firstName?.charAt(0) || '?'}
                      </div>
                      <span>{ride.driver?.firstName || 'Not assigned'} {ride.driver?.lastName || ''}</span>
                    </div>
                  </div>
                </div>

                <div className="ride-route">
                  <div className="route-point">
                    <div className="route-dot pickup"/>
                    <div>
                      <span className="route-label">Pickup</span>
                      <span className="route-address">{ride.pickupLocation}</span>
                    </div>
                  </div>
                  <div className="route-line"/>
                  <div className="route-point">
                    <div className="route-dot drop"/>
                    <div>
                      <span className="route-label">Drop</span>
                      <span className="route-address">{ride.dropLocation}</span>
                    </div>
                  </div>
                </div>

                <div className="ride-details">
                  <div className="detail">
                    <span className="detail-label">Fare</span>
                    <span className="detail-value">₹{ride.estimatedFare}</span>
                  </div>
                  <div className="detail">
                    <span className="detail-label">Distance</span>
                    <span className="detail-value">{ride.distance?.toFixed(1) || 'N/A'} km</span>
                  </div>
                  <div className="detail">
                    <span className="detail-label">Vehicle</span>
                    <span className="detail-value">{ride.vehicleType}</span>
                  </div>
                  <div className="detail">
                    <span className="detail-label">Date</span>
                    <span className="detail-value">
                      {new Date(ride.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageRides