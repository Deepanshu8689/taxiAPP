import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import "../../styles/driver/driverDashboard.css";
import { AlertCircle, Clock, IndianRupee, MapPin, Navigation, Phone, User } from 'lucide-react'
// import { AuthContext } from '../context/AuthContext';
import { createSocketConnection } from '../../utils/Socket/socket';
import { useDispatch, useSelector } from 'react-redux';
import { clearCurrentRide, setCurrentRide } from '../../utils/Redux/rideSlice';

const DriverDashboard = () => {

    const [distance, setDistance] = useState(0)
    const dispatch = useDispatch()
    const [duration, setDuration] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()
    const user = useSelector((state) => state.user)
    const [acceptedRide, setAcceptedRide] = useState(null)
    const socketRef = useRef(null)
    const [starting, setStarting] = useState(false)

    useEffect(() => {
        const socket = createSocketConnection()
        socketRef.current = socket

        socketRef.current.on('FE-ride-accepted', (ride) => {
            setAcceptedRide(ride)
        })

        socketRef.current.on('FE-ride-started', (startedRide) => {
            console.log("startedRide in event: ", startedRide)
            dispatch(setCurrentRide(startedRide))
            navigate('/driver/active-ride')
        })

        getAcceptedRide()

        return () => {
            if (socketRef.current) {
                socketRef.current.off('FE-ride-accepted')
                socketRef.current.off('FE-ride-started')
            }
        }
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            updateDistance()
        }, 10000)

        return () => {
            clearInterval(interval)
        }
    }, [acceptedRide])

    const getAcceptedRide = async () => {
        setLoading(true)
        setError(null)

        try {

            const res = await fetch("http://localhost:3000/ride/acceptedRide", {
                credentials: "include"
            })
            // console.log("res: ", res)
            if (!res.ok) throw new Error("failed to fetch acceptedRide")

            const data = await res.json()
            if (!data.ride) {
                navigate('/driver/home')
                return
            }
            setAcceptedRide(data.ride)

            const { driver, vehicleType, pickupLat, pickupLng } = data.ride
            const resDistance = await fetch(`http://localhost:3000/ride/currentDistance/${vehicleType}/${driver._id}/${pickupLat}/${pickupLng}`, {
                credentials: "include"
            })


            if (resDistance.ok) {
                const { distance, duration } = await resDistance.json()
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

    const updateDistance = async () => {
        if (!acceptedRide) {
            console.log("ride not found")
            return
        }

        try {
            const { driver, vehicleType, pickupLat, pickupLng } = acceptedRide

            const res = await fetch(`http://localhost:3000/ride/currentDistance/${vehicleType}/${driver._id}/${pickupLat}/${pickupLng}`, {
                credentials: "include"
            })


            if (res.ok) {
                const { distance, duration } = await res.json()
                console.log("distance and duration: ", distance, duration)
                socketRef.current.emit('BE-update-distance', { distance, duration, acceptedRide })
                setDistance(distance)
                setDuration(duration)
            }
        } catch (error) {
            console.log("error in updateDistance: ", error)
        }
    }

    const startRideHandler = async () => {
        setStarting(true)
        try {

            if (distance > 0.1) {
                alert("Cannot start the ride now. Reach to the pickup location.")
                return
            }

            const confirmStart = window.confirm("Are you sure you want to start this ride?")
            if (!confirmStart) return

            const res = await fetch(`http://localhost:3000/ride/startRide/${acceptedRide._id}`, {
                method: "PATCH",
                credentials: "include"
            })

            if (!res.ok) throw new Error("Failed to start the ride")
            const startedRide = await res.json();
            console.log("startedRide: ", startedRide)

            socketRef.current.emit('BE-start-ride', startedRide.ride)

        } catch (error) {
            console.error("Error in startRideHandler:", error)
            alert("Failed to start the ride. Please try again.")
        } finally {
            setStarting(false)
        }
    }

    const cancelHandler = async () => {
        const confirmCancel = window.confirm("Are you sure you want to cancel this ride?")
        if (!confirmCancel) return
        try {

            if (!acceptedRide) {
                navigate('/driver/home')
            }
            else {
                socketRef.current.emit('BE-acceptedRide-cancel', acceptedRide)
                dispatch(clearCurrentRide())
                alert("Ride cancelled successfully")
                navigate('/driver/home')
            }

            // acceptedRide(null)

        } catch (error) {
            console.error("Error in cancelHandler:", error)
            alert("Failed to cancel ride. Please try again.")
        }
    }

    const openMaps = () => {
        if (acceptedRide) {
            const { pickupLat, pickupLng } = acceptedRide
            const url = `https://www.google.com/maps/search/?api=1&query=${pickupLat},${pickupLng}`
            window.open(url, '_blank')
        }
    }

    const callRider = () => {
        if (acceptedRide?.rider?.phoneNumber) {
            window.location.href = `tel:${acceptedRide.rider.phoneNumber}`
        }
    }

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading ride details...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <div className="error-icon">⚠️</div>
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/driver/home')}>
                    Go to Homepage
                </button>
            </div>
        )
    }


    return (
        <div className="driver-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <h1>Ride Accepted!</h1>
                <p>Navigate to pickup location</p>
            </div>

            {/* Distance Card */}
            <div className="distance-card">
                <div className="distance-info">
                    <div className="distance-left">
                        <div className="icon-circle">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="3 11 22 2 13 21 11 13 3 11" />
                            </svg>
                        </div>
                        <div>
                            <p className="distance-value">{distance.toFixed(1)} km</p>
                            <p className="distance-label">away from rider</p>
                        </div>
                    </div>
                    <div className="distance-right">
                        <div className="time-display">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <p className="time-value">{Math.round(duration)} min</p>
                        </div>
                        <p className="time-label">estimated time</p>
                    </div>
                </div>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: distance > 0 ? '60%' : '100%' }}></div>
                </div>
            </div>

            {/* Rider Details */}
            {acceptedRide && (
                <div className="rider-details-card">
                    <h2>Rider Details</h2>

                    <div className="details-list">
                        <div className="detail-item">
                            <div className="detail-icon user-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <div className="detail-content">
                                <p className="detail-label">Name</p>
                                <p className="detail-value">
                                    {acceptedRide.rider.firstName} {acceptedRide.rider.lastName}
                                </p>
                            </div>
                        </div>

                        <div className="detail-item">
                            <div className="detail-icon phone-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                            </div>
                            <div className="detail-content">
                                <p className="detail-label">Contact</p>
                                <p className="detail-value">{acceptedRide.rider.phoneNumber}</p>
                            </div>
                        </div>

                        <div className="detail-item">
                            <div className="detail-icon pickup-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                            </div>
                            <div className="detail-content">
                                <p className="detail-label">Pickup Location</p>
                                <p className="detail-value">{acceptedRide.pickupLocation}</p>
                            </div>
                        </div>

                        <div className="detail-item">
                            <div className="detail-icon drop-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                            </div>
                            <div className="detail-content">
                                <p className="detail-label">Drop Location</p>
                                <p className="detail-value">{acceptedRide.dropLocation}</p>
                            </div>
                        </div>

                        <div className="detail-item">
                            <div className="detail-icon fare-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="1" x2="12" y2="23" />
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                            </div>
                            <div className="detail-content">
                                <p className="detail-label">Fare Amount</p>
                                <p className="detail-value fare-amount">₹{acceptedRide.estimatedFare}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
                <div className="button-row">
                    <button onClick={openMaps} className="action-btn navigate-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="3 11 22 2 13 21 11 13 3 11" />
                        </svg>
                        Navigate
                    </button>
                    <button onClick={callRider} className="action-btn call-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        Call Rider
                    </button>
                </div>

                <button
                    onClick={startRideHandler}
                    className="start-ride-btn"
                    disabled={starting}
                >
                    {starting ? 'Starting...' : 'Start Ride'}
                </button>

                <button onClick={cancelHandler} className="cancel-ride-btn">
                    Cancel Ride
                </button>
            </div>
        </div>
    )
}

export default DriverDashboard
