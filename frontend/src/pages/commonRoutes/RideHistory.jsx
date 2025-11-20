import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import '../../styles/common/rideHistory.css'
import { createSocketConnection } from '../../utils/Socket/socket'

const RideHistory = () => {
  const user = useSelector((store) => store.user)
  const navigate = useNavigate()
  const socketRef = useRef(null)
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    socketRef.current = createSocketConnection()

    socketRef.current.on('FE-ride-accepted', (acceptedRide) => {
      if (!acceptedRide) {
        throw new Error('Ride not found')
      }
      navigate('/rider/tracking')
    })

  }, [])

  useEffect(() => {
    fetchRideHistory()
  }, [])

  const fetchRideHistory = async () => {
    try {
      setLoading(true)
      console.log(`Fetching rides for user: ${user._id}`)
      const res = await fetch(`http://localhost:3000/ride/rideHistory/${user._id}`, {
        credentials: 'include'
      })

      if (!res.ok) throw new Error('Failed to fetch ride history')

      const data = await res.json()
      console.log('data: ', data)
      setRides(data || [])
    } catch (error) {
      console.error('Error fetching rides:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'status-completed'
      case 'cancelled': return 'status-cancelled'
      case 'started': return 'status-started'
      case 'requested': return 'status-requested'
      case 'scheduled': return 'status-scheduled'
      default: return ''
    }
  }

  const handleRideClick = (ride) => {
    // if (ride.status === 'completed') {
    //   const basePath = user.role === 'driver' ? '/driver' : '/rider'
    //   navigate(`${basePath}/complete/${ride._id}`)
    // }
  }

  if (loading) {
    return (
      <div className="history-loading">
        <div className="spinner"></div>
        <p>Loading ride history...</p>
      </div>
    )
  }

  return (
    <div className="history-page">
      <div className="history-container">
        <h1 className="page-title">Ride History</h1>

        {/* Filter Tabs */}
        {/* <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Rides
          </button>
          <button 
            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button 
            className={`filter-tab ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled
          </button>
        </div> */}

        {/* Rides List */}
        {rides.length === 0 ? (
          <div className="empty-history">
            <div className="empty-icon">📋</div>
            <h2>No rides found</h2>
            <p>Your ride history will appear here</p>
          </div>
        ) : (
          <div className="rides-list">
            {rides.map((ride) => (
              <div
                key={ride._id}
                className="ride-history-card"
                style={{ cursor: ride.status === 'completed' ? 'pointer' : 'default' }}
              >
                <div className="ride-header">
                  <div className="ride-date">{formatDate(ride.createdAt)}</div>
                  <span className={`ride-status ${getStatusColor(ride.status)}`}>
                    {ride.status}
                  </span>
                </div>

                {ride.status === 'scheduled' && <div className='ride-header'>
                  <div className="ride-date">Scheduled for: {formatDate(ride.scheduleDate)}</div>
                </div>}

                <div className="ride-locations">
                  <div className="location-row">
                    <div className="location-dot pickup"></div>
                    <div className="location-text">
                      <span className="location-label">Pickup</span>
                      <span className="location-value">{ride.pickupLocation}</span>
                    </div>
                  </div>

                  <div className="location-connector"></div>

                  <div className="location-row">
                    <div className="location-dot drop"></div>
                    <div className="location-text">
                      <span className="location-label">Drop</span>
                      <span className="location-value">{ride.dropLocation}</span>
                    </div>
                  </div>
                </div>

                {user.role === 'driver' ? (
                  <div className="ride-person">
                    <div className="person-avatar">
                      {ride.rider?.firstName?.charAt(0)}
                    </div>
                    <div className="person-info">
                      <span className="person-name">
                        {ride.rider?.firstName} {ride.rider?.lastName}
                      </span>
                      <span className="person-label">Rider</span>
                    </div>
                    {ride.status === 'completed' && <div>
                      <button className='ride-rating' onClick={() => navigate(`/driver/rate/${ride._id}`)}>
                        Exchange Ratings
                      </button>
                    </div>}
                  </div>
                ) : (
                  <div className="ride-person">
                    <div className="person-avatar">
                      {ride.driver?.firstName?.charAt(0)}
                    </div>
                    <div className="person-info">
                      <span className="person-name">
                        {ride.driver?.firstName} {ride.driver?.lastName}
                      </span>
                      <span className="person-label">Driver</span>
                    </div>
                    {ride.status === 'completed' && <div>
                      <button className='ride-rating' onClick={() => navigate(`/rider/rate/${ride._id}`)}>
                        Exchange Ratings
                      </button>
                    </div>}
                  </div>
                )}

                <div className="ride-footer">
                  <div className="ride-detail">
                    <span className="detail-icon">🚗</span>
                    <span>{ride.vehicleType}</span>
                  </div>
                  {ride.distance && (
                    <div className="ride-detail">
                      <span className="detail-icon">📍</span>
                      <span>{ride.distance.toFixed(1)} km</span>
                    </div>
                  )}
                  <div className="ride-detail fare">
                    <span className="detail-icon">₹</span>
                    <span>{ride.actualFare ? ride.actualFare : ride.estimatedFare}</span>
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

export default RideHistory