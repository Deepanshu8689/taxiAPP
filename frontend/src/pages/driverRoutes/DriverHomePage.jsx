import React, { useContext, useEffect, useRef, useState } from 'react'
import { createSocketConnection } from '../../utils/Socket/socket'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { removeUser } from '../../utils/Redux/userSlice'
import "../../styles/driver/driverPage.css"
import { clearCurrentRide, setCurrentRide } from '../../utils/Redux/rideSlice'

const DriverHomePage = () => {
    const user = useSelector((store) => store.user)
    const dispatch = useDispatch()
    const socketRef = useRef(null)
    const navigate = useNavigate()
    const [requestedRides, setRequestedRides] = useState([])
    const [loading, setLoading] = useState(false)
    const [locationLoading, setLocationLoading] = useState(false)
    const [acceptingRide, setAcceptingRide] = useState(null)

    useEffect(() => {
        if(user.isVerified) {
            fetchRequestedRides()
        }
        currentRide()
    }, [])

    const currentRide = async () => {
        try {
            const res = await fetch("http://localhost:3000/ride/currentRide", {
                credentials: "include"
            })

            if (!res.ok) {
                console.warn('Failed to fetch current ride')
                return
            }

            const data = await res.json()
            console.log("data: ", data)
            if (data.status === "accepted") {
                navigate('/driver/dashboard')
            }
            else if (data.status === "started") {
                navigate('/driver/active-ride')
            }

        } catch (error) {
            console.error("Error in currentRide:", error)
            return null
        }
    }

    const fetchRequestedRides = async () => {
        setLoading(true)
        try {
            const res = await fetch("http://localhost:3000/ride/requestedRides", {
                credentials: "include"
            })

            if (!res.ok) {
                throw new Error('Failed to fetch rides')
            }

            const data = await res.json()
            setRequestedRides(data)
        } catch (error) {
            console.error("Error in fetchRequestedRides:", error)
            alert('Failed to load rides')
        } finally {
            setLoading(false)
        }

    }

    useEffect(() => {
        const socket = createSocketConnection()
        socketRef.current = socket

        socketRef.current.on('FE-new-ride', (ride) => {
            console.log("New ride coming:", ride);
            if (ride) {
                setRequestedRides((rides) => [...rides, ride]);
            }
        })

        socketRef.current.on('FE-ride-accepted', (acceptedRideId) => {
            setRequestedRides((rides) => rides.filter(ride => ride._id !== acceptedRideId))
        })

        socketRef.current.on('FE-ride-cancelled', (rideId) => {
            console.log("Ride cancelled:", rideId);
            setRequestedRides((rides) => rides.filter(ride => ride._id !== rideId))
        })

        socketRef.current.on('FE-acceptedRide-cancel', (cancelledRide) => {
            console.log("Ride cancelled:", cancelledRide);
            setRequestedRides((rides) => rides.filter(ride => ride._id !== cancelledRide._id))
        })

        return () => {
            if (socketRef.current) {
                socketRef.current.off('FE-new-ride')
                socketRef.current.off('FE-ride-cancelled')
                socketRef.current.off('FE-acceptedRide-cancel')
            }
        }

    }, [])

    const locationHandler = async () => {
        setLocationLoading(true)
        try {
            if (!navigator.geolocation) {
                alert("Geolocation is not supported by this browser.")
                return
            }

            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords

                    const res = await fetch(
                        `http://localhost:3000/${user.role}/updateCurrentLocation`,
                        {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            credentials: "include",
                            body: JSON.stringify({ latitude, longitude })
                        }
                    )

                    if (res.ok) {
                        alert("Location updated successfully!")
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error)
                    alert("Failed to get location. Please enable location services.")
                }
            )
        } catch (error) {
            console.error("Error in locationHandler:", error)
            alert("Failed to update location")
        } finally {
            setLocationLoading(false)
        }
    }

    const handleAcceptRide = async (id) => {
        try {
            setAcceptingRide(id)
            dispatch(clearCurrentRide())
            const res = await fetch(`http://localhost:3000/ride/acceptRide/${id}`, {
                method: "Post",
                credentials: "include"
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Ride request failed")
            }

            console.log("Ride accepted:", data.updatedRide)

            socketRef.current.emit('BE-ride-accept', data.updatedRide)
            dispatch(setCurrentRide(data.updatedRide))

            // Remove accepted ride from list
            // setRequestedRides((rides) => rides.filter(ride => ride._id !== id))

            alert("Ride accepted successfully!")
            navigate('/driver/dashboard')
        } catch (error) {
            console.error("Error in handleAcceptRide:", error)
            alert(error.message || "Failed to accept ride")
        } finally {
            setAcceptingRide(null)
        }
    }

    const handleIgnoreRide = (id) => {
        setRequestedRides((rides) => rides.filter(ride => ride._id !== id))
    }


    return (
        <div className="driver-page">
            {/* Header */}
            <div className="driver-header">
                <div className="driver-info">
                    <div className="driver-avatar">
                        {user?.firstName?.charAt(0) || "D"}
                    </div>
                    <div>
                        <p className="driver-name">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="driver-email">{user?.emailId}</p>
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
                </div>
            </div>

            {/* Main Content */}
            <div className="driver-content">
                <div className="rides-header">
                    <h1>Available Rides</h1>
                    <span className="ride-count">{requestedRides.length} requests</span>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading rides...</p>
                    </div>
                ) : requestedRides.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
                                <path d="M5 17h-.8C3.5 17 3 16.5 3 15.8V13c0-.6.4-1 1-1h1V7c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v5h1c.6 0 1 .4 1 1v2.8c0 .7-.5 1.2-1.2 1.2H19" />
                                <circle cx="7" cy="17" r="2" />
                                <circle cx="17" cy="17" r="2" />
                            </svg>
                        </div>
                        <h2>No rides available</h2>
                        <p>Waiting for ride requests...</p>
                    </div>
                ) : (
                    <div className="rides-list">
                        {requestedRides.map((ride) => (
                            <div className="ride-card" key={ride._id}>
                                <div className="ride-locations">
                                    <div className="location-item">
                                        <div className="location-icon pickup">
                                            <div className="icon-dot"></div>
                                        </div>
                                        <div className="location-text">
                                            <p className="location-label">Pickup</p>
                                            <p className="location-value">{ride.pickupLocation}</p>
                                        </div>
                                    </div>

                                    <div className="location-divider"></div>

                                    <div className="location-item">
                                        <div className="location-icon drop">
                                            <div className="icon-square"></div>
                                        </div>
                                        <div className="location-text">
                                            <p className="location-label">Drop</p>
                                            <p className="location-value">{ride.dropLocation}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="ride-details">
                                    <div className="detail-item">
                                        <span className="detail-label">Fare</span>
                                        <span className="detail-value fare-value">₹{ride.estimatedFare}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Distance</span>
                                        <span className="detail-value">{ride.distance?.toFixed(1)} km</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Vehicle</span>
                                        <span className="detail-value">{ride.vehicleType}</span>
                                    </div>
                                </div>

                                {(ride.status === "requested" || ride.status === "scheduled") && (
                                    <div className="ride-actions">
                                        <button
                                            onClick={() => handleAcceptRide(ride._id)}
                                            className="accept-btn"
                                            disabled={acceptingRide === ride._id}
                                        >
                                            {acceptingRide === ride._id ? "Accepting..." : "Accept Ride"}
                                        </button>
                                        <button
                                            onClick={() => handleIgnoreRide(ride._id)}
                                            className="ignore-btn"
                                            disabled={acceptingRide === ride._id}
                                        >
                                            Ignore
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default DriverHomePage
