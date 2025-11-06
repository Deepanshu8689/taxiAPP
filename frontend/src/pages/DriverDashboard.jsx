import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import "./../styles/driverDashboard.css";
import { AlertCircle, Clock, IndianRupee, MapPin, Navigation, Phone, User } from 'lucide-react'
// import { AuthContext } from '../context/AuthContext';
import { createSocketConnection } from '../socket';
import { useSelector } from 'react-redux';

const DriverDashboard = () => {

    const [distance, setDistance] = useState(0)
    const [duration, setDuration] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()
    const user = useSelector((state) => state.user)
    const [ride, setRide] = useState(null)
    const socketRef = useRef(null)

    useEffect(() => {
        const socket = createSocketConnection()
        socketRef.current = socket

        getAcceptedRide()
        const interval = setInterval((ride) => {
            updateDistance(ride)
        }, 5000)

        return () => {
            clearInterval(interval)
        }


    }, [])

    const getAcceptedRide = async () => {
        try {

            setLoading(true)
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
            else{
                console.error("Failed to fetch distance and duration")
            }


        } catch (error) {
            console.error("Error in getAcceptedRide:", error)
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const updateDistance = async (ride) => {
        console.log("res in distance ")
        if (!ride) {
            console.log("ride not found")
            return
        }

        try {
            const { driver, vehicleType, pickupLat, pickupLng } = ride
            const { latitude: lat, longitude: long } = driver
            const res = await fetch(`http://localhost:3000/ride/currentDistance/${vehicleType}/${lat}/${long}/${pickupLat}/${pickupLng}`, {
                credentials: "include"
            })


            if (res.ok) {
                const { distance, duration } = await res.json()
                socketRef.current.emit('BE-update-distance', { lat, long, distance, duration, ride })
                setDistance(distance)
                setDuration(duration)
            }
        } catch (error) {
            console.log("error in updateDistance: ", error)
        }
    }

    const startRideHandler = async () => {
        alert("Ride started successfully")
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
            if (!res.ok) {
                throw new Error("Ride cancellation failed")
            }

            alert("Ride cancelled successfully")
            // acceptedRide(null)
            navigate('/driver-homepage')

        } catch (error) {
            console.error("Error in cancelHandler:", error)
            alert("Failed to cancel ride. Please try again.")
        }
    }

    const openMaps = () => {
        if (ride) {
            const { pickupLat, pickupLng } = ride
            const url = `https://www.google.com/maps/search/?api=1&query=${pickupLat},${pickupLng}`
            window.open(url, '_blank')
        }
    }

    const callRider = () => {
        if (ride) {
            window.location.href = `tel:${ride.rider.phoneNumber}`
        }
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-content">
                    <div className="spinner"></div>
                    <p>Loading ride details...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-content">
                    <AlertCircle className="error-icon" />
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/driver-homepage')} className="error-btn">
                        Go to Homepage
                    </button>
                </div>
            </div>
        )
    }


    return (
        <div className="driver-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>Ride Accepted!</h1>
                    <p>Navigate to pickup location</p>
                </div>
            </div>

            {/* Distance Card */}
            <div className="dashboard-content">
                <div className="distance-card">
                    <div className="distance-info">
                        <div className="distance-left">
                            <div className="icon-container navigation-icon">
                                <Navigation className="icon" />
                            </div>
                            <div>
                                <p className="distance-value">{distance} km</p>
                                <p className="distance-label">away from rider</p>
                            </div>
                        </div>
                        <div className="distance-right">
                            <div className="time-info">
                                <Clock className="time-icon" />
                                <p className="time-value">{duration} min</p>
                            </div>
                            <p className="time-label">estimated time</p>
                        </div>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill"></div>
                    </div>
                </div>
            </div>

            {/* Rider Details */}
            {ride && <div className="dashboard-content">
                <div className="rider-details-card">
                    <h2>Rider Details</h2>

                    <div className="details-list">
                        <div className="detail-item">
                            <div className="icon-container user-icon">
                                <User className="icon" />
                            </div>
                            <div className="detail-content">
                                <p className="detail-label">Name</p>
                                <p className="detail-value">{`${ride.rider.firstName} ${ride.rider.lastName}` || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="detail-item">
                            <div className="icon-container phone-icon">
                                <Phone className="icon" />
                            </div>
                            <div className="detail-content">
                                <p className="detail-label">Contact</p>
                                <p className="detail-value">{ride.rider.phoneNumber || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="detail-item">
                            <div className="icon-container pickup-icon">
                                <MapPin className="icon" />
                            </div>
                            <div className="detail-content">
                                <p className="detail-label">Pickup Location</p>
                                <p className="detail-value">{ride.pickupLocation || 'Location details'}</p>
                            </div>
                        </div>

                        <div className="detail-item">
                            <div className="icon-container drop-icon">
                                <MapPin className="icon" />
                            </div>
                            <div className="detail-content">
                                <p className="detail-label">Drop Location</p>
                                <p className="detail-value">{ride.dropLocation || 'Destination details'}</p>
                            </div>
                        </div>

                        <div className="detail-item">
                            <div className="icon-container fare-icon">
                                <IndianRupee className="icon" />
                            </div>
                            <div className="detail-content">
                                <p className="detail-label">Fare Amount</p>
                                <p className="detail-value">₹{ride.estimatedFare}</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>}

            {/* Action Buttons */}
            <div className="dashboard-content">
                <div className="action-buttons">
                    <div className="button-row">
                        <button onClick={openMaps} className="action-btn navigate-btn">
                            <Navigation className="btn-icon" />
                            Navigate
                        </button>
                        <button onClick={callRider} className="action-btn call-btn">
                            <Phone className="btn-icon" />
                            Call Rider
                        </button>
                    </div>

                    <button onClick={startRideHandler} className="start-ride-btn">
                        Start Ride
                    </button>

                    <button onClick={cancelHandler} className="cancel-ride-btn">
                        Cancel Ride
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DriverDashboard
