import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSocketConnection } from '../../utils/Socket/socket'
import "../../styles/searchingRide.css";
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentRide } from '../../utils/Redux/rideSlice';

const SearchingRide = () => {
  const navigate = useNavigate()
  const user = useSelector((store) => store.user)
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const [ride, setRide] = useState(null);

  useEffect(() => {
    const socket = createSocketConnection();
    socketRef.current = socket;
    getRequestedRide();
    socketRef.current.on('FE-ride-accepted', (acceptedRide) => {
      if (!acceptedRide) {
        throw new Error('Ride not found')
      }
      // locationHandler()
      dispatch(setCurrentRide(acceptedRide))
      setRide(acceptedRide)
      navigate('/rider/tracking')
    })


  }, [])

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


  const getRequestedRide = async () => {
    try {
      const res = await fetch("http://localhost:3000/ride/getRequestedRide", {
        credentials: "include"
      })

      const data = await res.json()
      if(!res.ok) {
        alert(data.message || "Ride request failed")
        navigate('/ride-request')
      }
      setRide(data)

    } catch (error) {
      console.log("error in getRequestedRide: ", error)
      throw error
    }
  }

  const cancelHandler = async () => {
    
    try {

      if (!ride) {
        navigate('/rider/request')
      } else {
        console.log("ride to be cancelled: ", ride)
        socketRef.current.emit('BE-ride-cancel', ride)
        alert("Ride cancelled successfully")
        navigate('/rider/request')
      }

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
