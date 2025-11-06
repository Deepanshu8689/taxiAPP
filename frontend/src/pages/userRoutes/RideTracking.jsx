import React, { useContext, useEffect, useReducer, useRef, useState } from 'react'
// import { AuthContext } from '../context/AuthContext'
import { createSocketConnection } from '../../utils/Socket/socket'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import "../../styles/rideTracking.css"

const RideTracking = () => {

  const [ride, setRide] = useState(null)
  const [distance, setDistance] = useState(0)
  const [duration, setDuration] = useState(0)
  const socketRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const user = useSelector((store) => store.user)

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
        navigate('/driver-homepage')
        return
      }
      setRide(data.ride)
      console.log("ride in getAcceptedRide: ", ride)

      const { driver, vehicleType, pickupLat, pickupLng } = data.ride
      const { latitude: lat2, longitude: long2 } = driver
      console.log("driver: ", driver)
      const resDistance = await fetch(`http://localhost:3000/ride/currentDistance/${vehicleType}/${pickupLat}/${pickupLng}/${lat2}/${long2}`, {
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



// const RideTracking = () => {
//   const [ride, setRide] = useState(null)
//   const [distance, setDistance] = useState(0)
//   const [duration, setDuration] = useState(0)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
  
//   const socketRef = useRef(null)
//   const pollIntervalRef = useRef(null)
//   const navigate = useNavigate()
//   const user = useSelector((store) => store.user)

//   useEffect(() => {
//     initializeTracking()

//     return () => {
//       cleanup()
//     }
//   }, [])

//   const initializeTracking = async () => {
//     try {
//       // Initialize socket connection
//       const socket = createSocketConnection()
//       socketRef.current = socket

//       socket.on('connect', () => {
//         console.log('Socket connected for ride tracking')
//       })

//       socket.on('FE-update-distance', (data) => {
//         console.log('Distance update received:', data)
//         const { distance, duration, ride } = data
//         setDistance(distance)
//         setDuration(duration)
//         if (ride) setRide(ride)
//       })

//       socket.on('FE-ride-started', () => {
//         alert('Your ride has started!')
//         navigate('/active-ride')
//       })

//       socket.on('FE-ride-cancelled', () => {
//         alert('Driver cancelled the ride')
//         navigate('/ride-request')
//       })

//       // Get initial ride data
//       await getAcceptedRide()

//       // Poll for updates every 20 seconds as backup
//       pollIntervalRef.current = setInterval(() => {
//         updateDistance()
//       }, 20000)

//     } catch (error) {
//       console.error('Error initializing tracking:', error)
//       setError('Failed to initialize ride tracking')
//     }
//   }

//   const getAcceptedRide = async () => {
//     setLoading(true)
//     try {
//       setError(null)
      
//       const res = await fetch("http://localhost:3000/ride/acceptedRide", {
//         credentials: "include"
//       })

//       if (!res.ok) {
//         throw new Error("Failed to fetch accepted ride")
//       }

//       const data = await res.json()
      
//       if (!data.ride) {
//         navigate('/ride-request')
//         return
//       }

//       setRide(data.ride)

//       // Get initial distance and duration
//       const { driver, vehicleType, pickupLat, pickupLng } = data.ride
//       const { latitude: lat2, longitude: long2 } = driver

//       const resDistance = await fetch(
//         `http://localhost:3000/ride/currentDistance/${vehicleType}/${pickupLat}/${pickupLng}/${lat2}/${long2}`,
//         { credentials: "include" }
//       )

//       if (resDistance.ok) {
//         const { distance, duration } = await resDistance.json()
//         setDistance(distance)
//         setDuration(duration)
//       }

//       // Join socket room for this ride
//       if (socketRef.current && data.ride._id) {
//         socketRef.current.emit('join-ride', { 
//           rideId: data.ride._id, 
//           userType: user.role 
//         })
//       }

//     } catch (error) {
//       console.error("Error in getAcceptedRide:", error)
//       setError(error.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const updateDistance = async () => {
//     if (!ride) return

//     try {
//       const { driver, vehicleType, pickupLat, pickupLng } = ride
//       const { latitude: lat2, longitude: long2 } = driver

//       const res = await fetch(
//         `http://localhost:3000/ride/currentDistance/${vehicleType}/${pickupLat}/${pickupLng}/${lat2}/${long2}`,
//         { credentials: "include" }
//       )

//       if (res.ok) {
//         const { distance, duration } = await res.json()
//         setDistance(distance)
//         setDuration(duration)
//       }
//     } catch (error) {
//       console.error('Error updating distance:', error)
//     }
//   }

//   const callDriver = () => {
//     if (ride?.driver?.phone) {
//       window.location.href = `tel:${ride.driver.phone}`
//     }
//   }

//   const cancelRide = async () => {
//     const confirmCancel = window.confirm('Are you sure you want to cancel this ride?')
//     if (!confirmCancel) return

//     try {
//       const res = await fetch(`http://localhost:3000/ride/cancelRide/${ride._id}`, {
//         method: 'PATCH',
//         credentials: 'include'
//       })

//       if (!res.ok) {
//         throw new Error('Failed to cancel ride')
//       }

//       alert('Ride cancelled successfully')
//       navigate('/ride-request')
//     } catch (error) {
//       console.error('Error cancelling ride:', error)
//       alert('Failed to cancel ride. Please try again.')
//     }
//   }

//   const cleanup = () => {
//     if (pollIntervalRef.current) {
//       clearInterval(pollIntervalRef.current)
//     }
//     if (socketRef.current) {
//       socketRef.current.off('FE-update-distance')
//       socketRef.current.off('FE-ride-started')
//       socketRef.current.off('FE-ride-cancelled')
//       socketRef.current.disconnect()
//     }
//   }

//   if (loading) {
//     return (
//       <div className="tracking-loading">
//         <div className="spinner"></div>
//         <p>Loading ride details...</p>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="tracking-error">
//         <p>{error}</p>
//         <button onClick={() => navigate('/ride-request')}>Go Back</button>
//       </div>
//     )
//   }

//   if (!ride) {
//     return (
//       <div className="tracking-error">
//         <p>No active ride found</p>
//         <button onClick={() => navigate('/ride-request')}>Go Back</button>
//       </div>
//     )
//   }

//   return (
//     <div className="ride-tracking">
//       <div className="tracking-header">
//         <h1>Driver is on the way</h1>
//         <div className="eta-badge">
//           <span className="eta-time">{Math.round(duration)}</span>
//           <span className="eta-label">min away</span>
//         </div>
//       </div>

//       <div className="driver-card">
//         <div className="driver-avatar">
//           <span>{ride.driver?.firstName?.charAt(0)}{ride.driver?.lastName?.charAt(0)}</span>
//         </div>

//         <div className="driver-info">
//           <h2>{ride.driver?.firstName} {ride.driver?.lastName}</h2>
//           <p className="vehicle-info">
//             {ride.vehicle?.vehicleName} • {ride.vehicle?.vehicleNumber}
//           </p>
//           <div className="distance-info">
//             <span className="distance-badge">{distance.toFixed(1)} km away</span>
//           </div>
//         </div>

//         <button className="call-btn" onClick={callDriver}>
//           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//             <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
//           </svg>
//         </button>
//       </div>

//       <div className="ride-details">
//         <div className="detail-row">
//           <span className="detail-label">Pickup</span>
//           <span className="detail-value">{ride.pickupLocation}</span>
//         </div>
//         <div className="detail-row">
//           <span className="detail-label">Drop</span>
//           <span className="detail-value">{ride.dropLocation}</span>
//         </div>
//         <div className="detail-row">
//           <span className="detail-label">Fare</span>
//           <span className="detail-value">₹{ride.estimatedFare}</span>
//         </div>
//       </div>

//       <div className="live-status">
//         <span className="status-dot"></span>
//         <span>Live tracking active</span>
//       </div>

//       <div className="tracking-actions">
//         <button className="cancel-btn" onClick={cancelRide}>
//           Cancel Ride
//         </button>
//       </div>
//     </div>
//   )
// }

// export default RideTracking