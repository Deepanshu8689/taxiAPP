import React, { useContext, useEffect, useReducer, useRef, useState } from 'react'
// import { AuthContext } from '../context/AuthContext'
import { createSocketConnection } from '../socket'

const RideTracking = () => {
  
  const acceptedRide = useSelector((store) => store.ride)
  const [ride, setRide] = useState(null)
  setRide(acceptedRide)
  const [distance, setDistance] = useState(0)
  const [duration, setDuration] = useState(0)
  const socketRef = useRef(null)

  useEffect(() => {
    const socket = createSocketConnection()
    socketRef.current = socket

    getAcceptedRide()

    socketRef.current.on('FE-update-distance', (data) => {
      const { distance, duration, ride } = data
      setDistance(distance)
      setDuration(duration)
      setRide(ride)
    })

    return () => {
      // socketRef.current.disconnect();
    }

  }, [])


  const getAcceptedRide = async () => {
    try {
      const res = await fetch("http://localhost:3000/ride/acceptedRide", {
        credentials: "include"
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Ride request failed")
      console.log("data: ", data.ride)
      // console.log("acceptedRide: ", acceptedRide)
      setRide(data.ride || acceptedRide)

      const { driver, vehicleType, pickupLat, pickupLng } = data.ride || acceptedRide

      const { latitude: lat2, longitude: long2 } = driver
      console.log("heloooooooooo")

      const resDisatnce = await fetch(`http://localhost:3000/ride/currentDistance/${vehicleType}/${pickupLat}/${pickupLng}/${lat2}/${long2}`, {
        credentials: "include"
      })

      const { distance, duration } = await resDisatnce.json()
      setDistance(distance)
      setDuration(duration)

    } catch (error) {
      console.log("error in getAcceptedRide: ", error)

    }
  }
  return (

    <div className="ride-tracking">
      <div className="tracking-header">
        <h1>Driver is on the way</h1>
        <div className="eta-badge">
          <span className="eta-time">{Math.round(duration)} min</span>
          <span className="eta-label"> away</span>
        </div>
      </div>

      {ride && <div className="driver-card">
        {/* <div className="driver-avatar">
          <span>{ride.driver.image}</span>
        </div> */}

        <div className="driver-info">
          <h2>{ride.driver?.firstName}</h2>
          <p className="vehicle-info">
            • {ride.vehicle.vehicleName} • {ride.vehicle.vehicleNumber}
          </p>
          <div className="distance-info">
            <span className="distance-badge">{distance.toFixed(1)} km away</span>
          </div>
        </div>

        {/* <button className="call-btn" onClick={callDriver}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </button> */}
      </div>}

      {ride &&
        <div className="ride-details">
          <div className="detail-row">
            <span className="detail-label">Pickup: </span>
            <span className="detail-value">{ride.pickupLocation}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Drop: </span>
            <span className="detail-value">{ride.dropLocation}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Fare: </span>
            <span className="detail-value">₹{ride.estimatedFare}</span>
          </div>
        </div>
      }

      {/* {driverLocation && (
        <div className="live-status">
          <span className="status-dot"></span>
          <span>Live tracking active</span>
        </div>
      )}

      <div className="tracking-actions">
        <button className="cancel-btn" onClick={cancelRide}>
          Cancel Ride
        </button>
      </div> */}
    </div>
  )
}

export default RideTracking
