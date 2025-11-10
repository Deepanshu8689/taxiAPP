import React, { useContext, useEffect, useReducer, useRef, useState } from 'react'
// import { AuthContext } from '../context/AuthContext'
import { createSocketConnection } from '../../utils/Socket/socket'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import "../../styles/user/rideTracking.css"
import { setCurrentRide } from '../../utils/Redux/rideSlice'

const RideTracking = () => {
  

  const [ride, setRide] = useState(null)
  const [distance, setDistance] = useState(0)
  const [duration, setDuration] = useState(0)
  const socketRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const user = useSelector((store) => store.user)
  const dispatch = useDispatch()

  useEffect(() => {
    const socket = createSocketConnection()
    socketRef.current = socket

    getAcceptedRide()

    socketRef.current.on('FE-update-distance', (data) => {
      const { distance, duration, acceptedRide } = data
      console.log("distance and duration in rideTracking: ", distance, duration)
      setDistance(distance)
      setDuration(duration)
      setRide(acceptedRide)
    })

    socketRef.current.on('FE-acceptedRide-cancelled', () => {
      alert(`Ride cancelled by driver!!
      Please wait for 30 seconds before requesting another ride.`)
      navigate('/rider/searching')
    })

    socketRef.current.on('FE-ride-started', (startedRide) => {
      console.log("ride started in event: ", startedRide)
      dispatch(setCurrentRide(startedRide))
      navigate('/rider/active-ride')
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.off('FE-update-distance')
        socketRef.current.off('FE-acceptedRide-cancelled')
        socketRef.current.off('FE-ride-started')
      }
    }

  }, [])

  const getAcceptedRide = async () => {
    setLoading(true)
    try {

      setError(null)
      const res = await fetch("http://localhost:3000/ride/acceptedRide", {
        credentials: "include"
      })
      // console.log("res: ", res)
      if (!res.ok) throw new Error("failed to fetch acceptedRide")

      const data = await res.json()
      if (!data.ride) {
        navigate('/rider/searching')
        return
      }
      setRide(data.ride)

      const { driver, vehicleType, pickupLat, pickupLng } = data.ride
      const resDistance = await fetch(`http://localhost:3000/ride/currentDistance/${vehicleType}/${driver._id}/${pickupLat}/${pickupLng}`, {
        credentials: "include"
      })


      if (resDistance.ok) {
        const { distance, duration } = await resDistance.json()
        console.log("distance and duration: ", distance, duration)
        setDistance(distance)
        setDuration(duration)
      }
      else {
        console.error("Failed to fetch distance and duration")
      }


    } catch (error) {
      console.error("Error in getAcceptedRide:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }

  }

  const callDriver = () => {
    if (ride?.driver?.phoneNumber) {
      window.location.href = `tel:${ride.driver.phoneNumber}`
    }
  }
   if (loading) {
    return (
      <div className="tracking-loading">
        <div className="spinner"></div>
        <p>Loading ride details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="tracking-error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={() => navigate('/rider/request')}>Go Back</button>
      </div>
    )
  }

  if (!ride) {
    return (
      <div className="tracking-error">
        <div className="error-icon">📭</div>
        <p>No active ride found</p>
        <button onClick={() => navigate('/rider/request')}>Go Back</button>
      </div>
    )
  }

  return (
    <div className="ride-tracking">
      <div className="tracking-header">
        <h1>Driver is on the way</h1>
        <div className="eta-badge">
          <span className="eta-time">{Math.round(duration)}</span>
          <span className="eta-label">min away</span>
        </div>
      </div>

      <div className="driver-card">
        <div className="driver-avatar">
          <span>
            {ride.driver?.firstName?.charAt(0)}{ride.driver?.lastName?.charAt(0)}
          </span>
        </div>

        <div className="driver-info">
          <h2>{ride.driver?.firstName} {ride.driver?.lastName}</h2>
          <p className="vehicle-info">
            {ride.vehicle?.vehicleName} • {ride.vehicle?.vehicleNumber}
          </p>
          <div className="distance-info">
            <span className="distance-badge">{distance.toFixed(1)} km away</span>
          </div>
        </div>

        <button className="call-btn" onClick={callDriver}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </button>
      </div>

      <div className="ride-details">
        <div className="detail-row">
          <span className="detail-label">Pickup</span>
          <span className="detail-value">{ride.pickupLocation}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Drop</span>
          <span className="detail-value">{ride.dropLocation}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Fare</span>
          <span className="detail-value">₹{ride.estimatedFare}</span>
        </div>
      </div>

      <div className="live-status">
        <span className="status-dot"></span>
        <span>Live tracking active</span>
      </div>

    </div>
  )
}

export default RideTracking