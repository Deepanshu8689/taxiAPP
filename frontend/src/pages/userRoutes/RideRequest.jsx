import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/user/rideRequest.css";
import { useDispatch, useSelector } from "react-redux";
import { removeUser } from "../../utils/Redux/userSlice";
import { setCurrentRide } from "../../utils/Redux/rideSlice";
import { createSocketConnection } from "../../utils/Socket/socket";

export default function RideRequest() {
  const socketRef = useRef(null);

  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [fares, setFares] = useState([]);
  const [requestData, setRequestData] = useState({});
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false)


  useEffect(() => {
    currentRide()
    fetchCompletedUnpaidRide()
  }, [])

  useEffect(() => {
    if (!user) {
      console.log("No user found, redirecting to login");
    };

    const socket = createSocketConnection();
    socketRef.current = socket;
    getRequestedRide()

  }, [])

  const fetchCompletedUnpaidRide = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:3000/ride/unpaidCompletedRide`, {
        credentials: 'include'
      })

      if (!res.ok) {
        throw new Error('Failed to fetch ride details')
      }

      const data = await res.json()
      if(!data.success) return
      console.log('Fetched unpaid completed ride details:', data)
      navigate(`/rider/payment/${data._id}`)

    } catch (error) {
      console.error('Error fetching ride:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const currentRide = async () => {
    try {
      const res = await fetch("http://localhost:3000/ride/currentRide", {
        credentials: "include"
      })

      if (!res.ok) {
        throw new Error('Failed to fetch current ride')
      }

      const data = await res.json()
      console.log("data: ", data)
      if (data.status === "accepted") {
        navigate('/rider/tracking')
      }
      else if (data.status === "started") {
        navigate('/rider/active-ride')
      }

    } catch (error) {
      console.error("Error in currentRide:", error)
      return null
    }
  }

  const locationHandler = async (e) => {
    e.preventDefault()
    setLocationLoading(true);
    try {

      if (!navigator.geolocation) {
        alert("Geolocation is not supported by this browser.")
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

          await res.json()
          alert("Location updated successfully")
        }
      )
    } catch (error) {
      console.error("Error in locationHandler:", error);
      alert("Failed to update location");
    }
    finally {
      setLocationLoading(false);
    }
  }

  const logoutHandler = async (e) => {
    e.preventDefault();
    try {

      const res = await fetch("http://localhost:3000/auth/logout", {
        method: "Post",
        credentials: "include",
      })

      dispatch(removeUser())
      navigate('/')

    } catch (error) {
      console.log("error in logoutHandler: ", error)
      throw error
    }
  }

  const bookRideHandler = async (fare) => {

    try {
      const body = {
        pickupLocation,
        dropLocation,
        vehicleType: fare.vehicleType,
        distance: requestData.distance,
        estimatedFare: fare.estimatedFare,
        pickupLat: requestData.pickUpCoords.latitude,
        pickupLng: requestData.pickUpCoords.longitude,
        dropLat: requestData.dropCoords.latitude,
        dropLng: requestData.dropCoords.longitude
      }

      const res = await fetch("http://localhost:3000/ride/requestRide", {
        method: "Post",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(body)
      })

      const createdRide = await res.json()
      if (!res.ok) throw new Error(data.message || "Ride request failed");

      dispatch(setCurrentRide(createdRide))
      socketRef.current.emit('BE-request-ride', createdRide)

      navigate('/rider/searching')
    } catch (error) {
      console.log("error in bookRideHandler: ", error)
      alert(error.message)
    }

  }

  const getRequestedRide = async () => {
    try {
      const res = await fetch("http://localhost:3000/ride/getRequestedRide", {
        credentials: "include"
      })

      const data = await res.json()
      if (!data.success) {
        console.log("No requested ride found, proceed to book a ride")
      }
      else {
        navigate('/rider/searching')
      }

    } catch (error) {
      console.log("error in getRequestedRide: ", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pickupLocation || !dropLocation) {
      alert("Enter both pickup and drop locations");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/ride/getFares", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // for cookies
        body: JSON.stringify({
          pickupLocation,
          dropLocation
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Ride request failed");

      if (data.length === 0) {
        alert("No rides available")
        setFares([])
        return
      }


      setFares(data.fares)
      setRequestData(data)

    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ride-request-page">
      {/* Header */}
      <div className="request-header">
        <div className="user-info">
          <div className="user-avatar">
            {user?.firstName?.charAt(0) || "U"}
          </div>
          <div>
            <p className="user-name">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="user-email">{user?.emailId}</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="icon-btn"
            onClick={locationHandler}
            disabled={locationLoading}
            title="Update Location"
          >
            📍
          </button>
          <button
            className="icon-btn logout-btn"
            onClick={logoutHandler}
            title="Logout"
          >
            🚪
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="request-content">
        <div className="request-card">
          <h2>Where to?</h2>
          <p className="request-subtitle">Enter your journey details</p>

          <form onSubmit={handleSubmit} className="location-form">
            <div className="input-group">
              <div className="input-icon pickup-icon">
                <div className="icon-dot"></div>
              </div>
              <input
                type="text"
                placeholder="Pickup location"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                required
              />
            </div>

            <div className="location-divider"></div>

            <div className="input-group">
              <div className="input-icon drop-icon">
                <div className="icon-square"></div>
              </div>
              <input
                type="text"
                placeholder="Drop location"
                value={dropLocation}
                onChange={(e) => setDropLocation(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="search-btn" disabled={loading}>
              {loading ? "Searching..." : "Search Rides"}
            </button>
          </form>
        </div>

        {/* Fare Options */}
        {fares.length > 0 && (
          <div className="fares-section">
            <h3>Choose a ride</h3>
            <div className="fare-list">
              {fares.map((fare, index) => (
                <div key={index} className="fare-card">
                  <div className="fare-left">
                    <div className="vehicle-icon">
                      {fare.vehicleType === "bike" ? "🏍️" :
                        fare.vehicleType === "auto" ? "🛺" : "🚗"}
                    </div>
                    <div className="fare-details">
                      <h4>{fare.vehicleType}</h4>
                      <p className="fare-eta">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {fare.durationMin} away
                      </p>
                    </div>
                  </div>
                  <button
                    className="book-btn"
                    onClick={() => bookRideHandler(fare)}
                  >
                    ₹{fare.estimatedFare}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
