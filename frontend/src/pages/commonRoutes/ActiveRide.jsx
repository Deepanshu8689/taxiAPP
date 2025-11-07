import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentRide } from '../../utils/Redux/rideSlice'
import { createSocketConnection } from '../../utils/Socket/socket'

const ActiveRide = () => {
  const user = useSelector((store) => store.user)
  const dispatch = useDispatch()
  const [ride, setRide] = useState(null)
  const socketRef = useRef(null)

  useEffect(() => {
    const socket = createSocketConnection()
    socketRef.current = socket
    fetchStartedRide()
  }, [])

  const fetchStartedRide = async () => {
    if (ride) {
      return
    }
    else {
      try {
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
    }
  }

  const completeRideHandler = async () => {
    try {

      const res = await fetch(`http://localhost:3000/ride/completeRide/${ride._id}`, {
        method: "PATCH",
        credentials: "include"
      })
      const data = await res.json()
      console.log("endRide: ", data)
      dispatch(setCurrentRide(null))
      setRide(null)

      socketRef.current.emit('BE-ride-completed', data)
      alert("Ride completed successfully!")

    } catch (error) {
      console.log("error in completeRideHandler: ", error)
      throw error
    }
  }

  return (
    <div>
      {ride && <div>
        <h1>Active Ride</h1>
        <div>Pickup location: { ride.pickupLocation }</div>
        <div>Drop location: { ride.dropLocation }</div>
      </div>}

      {
        user.role === 'driver' ? (
          <div>
            <button onClick={completeRideHandler}>
              Complete Ride
            </button>
          </div>
        ) : (
          <div>
            Ride Started. Enjoy your trip!!
          </div>
        )
      }
    </div>
  )
}

export default ActiveRide
