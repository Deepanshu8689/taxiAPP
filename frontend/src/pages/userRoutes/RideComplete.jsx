import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import "../../styles/user/rideComplete.css";

const RideComplete = () => {

    const navigate = useNavigate()
    const { rideId } = useParams()

    const [ride, setRide] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [rating, setRating] = useState(0)
    const [paymentProcessing, setPaymentProcessing] = useState(false)

    const { user } = useSelector((state) => state.user)

    useEffect(() => {
        if(!user) {
            navigate('/')
        }
    }, [user])

    useEffect(() => {
        fetchRideDetails()
    }, [rideId])

    const fetchRideDetails = async () => {
        try {
            setLoading(true)
            setError(null)

            const res = await fetch(`http://localhost:3000/ride/getRide/${rideId}`, {
                credentials: 'include'
            })

            if (!res.ok) {
                throw new Error('Failed to fetch ride details')
            }

            const data = await res.json()
            setRide(data.ride)
        } catch (error) {
            console.error('Error fetching ride:', error)
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleRating = async (stars) => {
        setRating(stars)

        try {
            await fetch(`http://localhost:3000/ride/rate/${rideId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ rating: stars })
            })
        } catch (error) {
            console.error('Error submitting rating:', error)
        }
    }

    const handlePayment = async () => {
        setPaymentProcessing(true)

        try {
            const res = await fetch(`http://localhost:3000/payment/process/${rideId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    amount: ride.fare,
                    paymentMethod: 'online' // or 'cash'
                })
            })

            if (!res.ok) {
                throw new Error('Payment failed')
            }

            const data = await res.json()
            alert('Payment successful!')
            navigate('/rider-homepage')
        } catch (error) {
            console.error('Error processing payment:', error)
            alert('Payment failed. Please try again.')
        } finally {
            setPaymentProcessing(false)
        }
    }

    const formatDuration = (startTime, endTime) => {
        const start = new Date(startTime)
        const end = new Date(endTime)
        const diffMs = end - start
        const diffMins = Math.round(diffMs / 60000)
        return diffMins
    }

    const formatDistance = (distance) => {
        return distance ? distance.toFixed(1) : '0.0'
    }

    if (loading) {
        return (
            <div className="complete-loading">
                <div className="spinner"></div>
                <p>Loading ride details...</p>
            </div>
        )
    }

    if (error || !ride) {
        return (
            <div className="complete-error">
                <p>{error || 'Ride not found'}</p>
                <button onClick={() => navigate('/rider-homepage')}>Go Home</button>
            </div>
        )
    }

    const rideDuration = ride.startTime && ride.endTime
        ? formatDuration(ride.startTime, ride.endTime)
        : 0

    return (
        <div className="ride-complete">
            <div className="complete-header">
                <div className="success-icon">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#4caf50" strokeWidth="2" />
                        <path d="M8 12l3 3 5-5" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h1>Ride Completed!</h1>
                <p className="complete-subtitle">Hope you had a great ride</p>
            </div>

            <div className="fare-card">
                <div className="fare-amount">
                    <span className="currency">₹</span>
                    <span className="amount">{ride.estimatedFare}</span>
                </div>
                <p className="fare-label">Total Fare</p>
            </div>

            <div className="ride-summary">
                <h2>Ride Summary</h2>

                <div className="summary-row">
                    <div className="summary-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                    <div className="summary-content">
                        <span className="summary-label">Duration</span>
                        <span className="summary-value">{rideDuration} mins</span>
                    </div>
                </div>

                <div className="summary-row">
                    <div className="summary-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                    </div>
                    <div className="summary-content">
                        <span className="summary-label">Distance</span>
                        <span className="summary-value">{formatDistance(ride.distance)} km</span>
                    </div>
                </div>

                <div className="summary-row">
                    <div className="summary-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                            <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                    </div>
                    <div className="summary-content">
                        <span className="summary-label">Payment</span>
                        <span className="summary-value">{ride.paymentStatus === 'completed' ? 'Paid' : 'Pending'}</span>
                    </div>
                </div>
            </div>

            <div className="trip-details">
                <div className="location-row">
                    <div className="location-marker pickup-marker"></div>
                    <div className="location-info">
                        <p className="location-label">Pickup</p>
                        <p className="location-address">{ride.pickupAddress}</p>
                    </div>
                </div>

                <div className="location-divider"></div>

                <div className="location-row">
                    <div className="location-marker drop-marker"></div>
                    <div className="location-info">
                        <p className="location-label">Drop</p>
                        <p className="location-address">{ride.dropAddress}</p>
                    </div>
                </div>
            </div>

            <div className="driver-info-card">
                <div className="driver-avatar-small">
                    <span>{ride.driver?.firstName?.charAt(0)}{ride.driver?.lastName?.charAt(0)}</span>
                </div>
                <div className="driver-details">
                    <p className="driver-name">{ride.driver?.firstName} {ride.driver?.lastName}</p>
                    <p className="driver-vehicle">{ride.driver?.vehicle?.vehicleName}</p>
                </div>
            </div>

            <div className="rating-section">
                <h3>Rate your ride</h3>
                <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            className={`star-btn ${rating >= star ? 'active' : ''}`}
                            onClick={() => handleRating(star)}
                        >
                            <svg width="32" height="32" viewBox="0 0 24 24" fill={rating >= star ? '#ffc107' : 'none'} stroke={rating >= star ? '#ffc107' : '#ddd'} strokeWidth="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        </button>
                    ))}
                </div>
            </div>

            <div className="complete-actions">
                {ride.paymentStatus !== 'completed' && (
                    <button
                        className="payment-btn"
                        onClick={handlePayment}
                        disabled={paymentProcessing}
                    >
                        {paymentProcessing ? 'Processing...' : 'Make Payment'}
                    </button>
                )}

                <button
                    className="home-btn"
                    onClick={() => navigate('/rider-homepage')}
                >
                    Back to Home
                </button>
            </div>
        </div>
    )
}

export default RideComplete
