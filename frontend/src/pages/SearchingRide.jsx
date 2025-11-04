import React, { useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { createSocketConnection } from '../socket'
import "./../styles/searchingRide.css";
import { useSelector } from 'react-redux';

const SearchingRide = () => {
  const navigate = useNavigate()
  const user = useSelector((store) => store.user)
  const ride = useSelector((store) => store.ride)
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = createSocketConnection();
    socketRef.current = socket;

    socketRef.current.emit('register', user)

    socketRef.current.emit('BE-request-ride', ride )

    socketRef.current.on('FE-ride-accepted', (acceptedRide) => {
      if (!acceptedRide) {
        throw new Error('Ride not found')
      }
      // locationHandler()
      ride = acceptedRide
      navigate('/ride-tracking')
    })

    return () => {
      socketRef.current.disconnect();
    };
  }, [user])

  const locationHandler = async (e) => {
    e.preventDefault()
    try {

      if (!navigator.geolocation) {
        console.log("Geolocation is not supported by this browser.")
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;

          const res = await fetch(`http://localhost:3000/${user.role}/updateCurrentLocation`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json"
              },
              credentials: "include",
              body: JSON.stringify({ latitude, longitude })
            }
          )

          const data = await res.json()
          console.log("data: ", data)
        }
      )
    } catch (error) {
      console.log("error in locationHandler: ", error)
      throw error
    }
  }

  const cancelHandler = async () => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this ride?")
    if (!confirmCancel) return
    try {

      const { _id } = ride
      const res = await fetch(`http://localhost:3000/ride/cancelRide/${_id}`, {
        method: "PATCH",
        credentials: "include"
      })
      await res.json()
      if (!res.ok) {
        throw new Error("Ride cancellation failed")
      }

      alert("Ride cancelled successfully")
      navigate('/ride-request')

    } catch (error) {
      console.log("error in cancelHandler: ", error)
      throw error
    }
  }
  return (
    <div className="searching-container">
      <div className="loader"></div>
      <h2>Searching for nearby drivers...</h2>
      <p>Please wait while we connect you with the best driver available.</p>
      <button className="cancel-btn" onClick={cancelHandler}>
        Cancel Ride
      </button>
    </div>
  );
}

export default SearchingRide
