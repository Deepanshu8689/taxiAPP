import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/rideRequest.css";
import { useDispatch, useSelector } from "react-redux";
import { removeUser } from "../utils/userSlice";

export default function RideRequest() {
  const user = useSelector((store) => store.user)
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [fares, setFares] = useState([]);
  const [requestData, setRequestData] = useState({});
  const [loading, setLoading] = useState(false);


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

  const logoutHandler = async (e) => {
    e.preventDefault();
    try {

      const res = await fetch("http://localhost:3000/auth/logout", {
        method: "Post"
      })

      dispatch(removeUser())
      navigate('/login')

    } catch (error) {
      console.log("error in logoutHandler: ", error)
      throw error
    }
  }

  const bookRideHandler = async (fare) => {

    try {
      const estimatedFare = fare.estimatedFare
      const vehicleType = fare.vehicleType
      const distance = requestData.distance
      const pickupLat = requestData.pickUpCoords.latitude
      const pickupLng = requestData.pickUpCoords.longitude
      const dropLat = requestData.dropCoords.latitude
      const dropLng = requestData.pickUpCoords.latitude

      const body = {
        pickupLocation,
        dropLocation,
        vehicleType,
        distance,
        estimatedFare,
        pickupLat,
        pickupLng,
        dropLat,
        dropLng
      }

      const res = await fetch("http://localhost:3000/ride/requestRide", {
        method: "Post",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Ride request failed");
      
      dispatch(addRide(data))
      
      navigate('/searching-ride')
    } catch (error) {
      console.log("error in bookRideHandler: ", error)
      throw error
    }

  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pickupLocation || !dropLocation) {
      alert("Enter both pickup and dropoff locations");
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
      console.log("data: ", data)
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
    <div className="ride-request-container">
      <div>
        {user && <h2>{user.emailId}</h2>}
      </div>
      <div>
        <button onClick={logoutHandler}>
          Logout
        </button>
        <button onClick={locationHandler}>
          CurrentLocation
        </button>

      </div>
      <h2>Request a Ride</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Pickup location"
          value={pickupLocation}
          onChange={(e) => setPickupLocation(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Drop location"
          value={dropLocation}
          onChange={(e) => setDropLocation(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Requesting..." : "Request Ride"}
        </button>
      </form>

      <div className="fare-list">
        {fares.length > 0 &&
          fares.map((fare, index) => (
            <div key={index} className="fare-card">
              <div className="fare-info">
                <div className="fare-vehicle">
                  <h4>{fare.vehicleType}</h4>
                  <p className="fare-time">ETA: {fare.durationMin}</p>
                </div>
                <button
                  className="fare-price-btn"
                  onClick={() => bookRideHandler(fare)}
                >
                  ₹{fare.estimatedFare}
                </button>
              </div>
            </div>
          ))}
      </div>

    </div>
  );
}
