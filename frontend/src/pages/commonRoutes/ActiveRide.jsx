import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentRide } from '../../utils/Redux/rideSlice'
import { createSocketConnection } from '../../utils/Socket/socket'
import { useNavigate } from 'react-router-dom'
import '../../styles/common/activeRide.css'

const ActiveRide = () => {
  const user = useSelector((store) => store.user)
  const dispatch = useDispatch()
  const [ride, setRide] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const socketRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const socket = createSocketConnection()
    socketRef.current = socket

    socketRef.current.on('FE-ride-completed', (completedRide) => {
      dispatch(setCurrentRide(null))
      setRide(null)
      console.log("ride completed: ", completedRide)
      if(user.role === 'driver') {
        alert("Ride completed successfully")
        navigate('/driver/completed-ride')
      }
      else{
        navigate(`/rider/payment/${completedRide._id}`)
      }
    })

    fetchStartedRide()

    return () => {
      if(socketRef.current) {
        socketRef.current.off('FE-ride-completed')
      }
    }
  }, [])

  const fetchStartedRide = async () => {
    if (ride) {
      return
    }
    else {
      try {
        setLoading(true)
        const res = await fetch("http://localhost:3000/ride/getStartedRide", {
          credentials: "include"
        })
        const startedRide = await res.json()
        console.log("startedRide: ", startedRide)
        dispatch(setCurrentRide(startedRide.ride))
        setRide(startedRide.ride)

      } catch (error) {
        console.log("error in fetchStartedRide: ", error)
        throw error
      }
      finally{
        setLoading(false)
      }
    }
  }

  const completeRideHandler = async () => {
    if(!window.confirm("Are you sure you want to complete the ride?")) {
      return
    }
    try {
      setCompleting(true)

      const res = await fetch(`http://localhost:3000/ride/completeRide/${ride._id}`, {
        method: "PATCH",
        credentials: "include"
      })

      if(!res.ok){
        throw new Error("Failed to complete the ride")
      }

      const data = await res.json()

      dispatch(setCurrentRide(null))
      setRide(null)

      socketRef.current.emit('BE-ride-completed', data)
      alert("Ride completed successfully!")

    } catch (error) {
      console.log("error in completeRideHandler: ", error)
      throw error
    } finally{
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="active-ride-loading">
        <div className="spinner"></div>
        <p>Loading ride details...</p>
      </div>
    )
  }

  if (!ride) {
    return (
      <div className="active-ride-empty">
        <p>No active ride found</p>
      </div>
    )
  }

  return (
    (ride && <div className="active-ride">
      <div className="ride-status-header">
        <div className="status-indicator">
          <div className="pulse-ring"></div>
          <div className="pulse-dot"></div>
        </div>
        <h1>Ride in Progress</h1>
        <p className="ride-subtitle">
          {user.role === 'driver' ? 'Complete the ride when you reach destination' : 'Sit back and enjoy your ride'}
        </p>
      </div>

      <div className="trip-info-card">
        <h2>Trip Details</h2>
        
        <div className="trip-locations">
          <div className="location-item">
            <div className="location-icon pickup">
              <div className="icon-dot"></div>
            </div>
            <div className="location-text">
              <p className="location-label">Pickup</p>
              <p className="location-value">{ride.pickupLocation}</p>
            </div>
          </div>

          <div className="location-divider">
            <div className="divider-line"></div>
          </div>

          <div className="location-item">
            <div className="location-icon drop">
              <div className="icon-square"></div>
            </div>
            <div className="location-text">
              <p className="location-label">Destination</p>
              <p className="location-value">{ride.dropLocation}</p>
            </div>
          </div>
        </div>

        <div className="trip-details">
          <div className="detail-item">
            <span className="detail-label">Fare</span>
            <span className="detail-value">₹{ride.estimatedFare}</span>
          </div>
          {ride.distance && (
            <div className="detail-item">
              <span className="detail-label">Distance</span>
              <span className="detail-value">{ride.distance.toFixed(1)} km</span>
            </div>
          )}
          <div className="detail-item">
            <span className="detail-label">Vehicle</span>
            <span className="detail-value">{ride.vehicleType}</span>
          </div>
        </div>
      </div>

      {user.role === 'driver' ? (
        <div className="rider-info-card">
          <h3>Rider Information</h3>
          <div className="rider-details">
            <div className="rider-avatar">
              {ride.rider?.firstName?.charAt(0)}
            </div>
            <div className="rider-text">
              <p className="rider-name">{ride.rider?.firstName} {ride.rider?.lastName}</p>
              <p className="rider-phone">{ride.rider?.phone}</p>
            </div>
            <a href={`tel:${ride.rider?.phone}`} className="call-btn-small">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </a>
          </div>
        </div>
      ) : (
        <div className="driver-info-card">
          <h3>Your Driver</h3>
          <div className="driver-details">
            <div className="driver-avatar">
              {ride.driver?.firstName?.charAt(0)}
            </div>
            <div className="driver-text">
              <p className="driver-name">{ride.driver?.firstName} {ride.driver?.lastName}</p>
              <p className="vehicle-info">{ride.vehicle?.vehicleName} • {ride.vehicle?.vehicleNumber}</p>
            </div>
            <a href={`tel:${ride.driver?.phone}`} className="call-btn-small">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </a>
          </div>
        </div>
      )}

      {user.role === 'driver' && (
        <div className="action-section">
          <button 
            className="complete-ride-btn" 
            onClick={completeRideHandler}
            disabled={completing}
          >
            {completing ? 'Completing...' : 'Complete Ride'}
          </button>
        </div>
      )}

      {user.role === 'user' && (
        <div className="rider-message">
          <div className="message-icon">✨</div>
          <p>Enjoy your trip!</p>
          <small>Driver will complete the ride when you reach your destination</small>
        </div>
      )}
    </div>)
  )
}

export default ActiveRide
