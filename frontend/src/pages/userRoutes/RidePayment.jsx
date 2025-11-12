import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import '../../styles/user/ridePayment.css'

const RidePayment = () => {
    const { rideId } = useParams()
    const navigate = useNavigate()

    const [ride, setRide] = useState(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchRideDetails()
        loadRazorpayScript()
    }, [rideId])

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    const fetchRideDetails = async () => {
        try {
            setLoading(true)
            const res = await fetch(`http://localhost:3000/ride/getRide/${rideId}`, {
                credentials: 'include'
            })

            if (!res.ok) {
                throw new Error('Failed to fetch ride details')
            }

            const data = await res.json()
            console.log('Fetched ride details:', data)
            
            if(!data) return
            setRide(data)
        } catch (error) {
            console.error('Error fetching ride:', error)
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleCashPayment = async () => {
        if (!window.confirm('Confirm that you have paid cash to the driver?')) {
            return
        }

        try {
            setProcessing(true)
            alert(`Payment confirmed successfully!
            \nBack to homePage`)
            navigate(`/rider/request`)
        } catch (error) {
            console.error('Payment error:', error)
            alert('Payment failed. Please try again.')
        } finally {
            setProcessing(false)
        }
    }

    const handleRazorpayPayment = async () => {
        try {
            setProcessing(true)

            // Create Razorpay order on backend
            const orderRes = await fetch(`http://localhost:3000/payment/create-order`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({amount: Number(ride.actualFare)})
            })

            if (!orderRes.ok) {
                throw new Error('Failed to create payment order')
            }

            const orderData = await orderRes.json()

            const options = {
                key: orderData.key,
                amount: orderData.order.amount, // Amount in paise
                currency: orderData.order.currency,
                name: 'RideEase',
                description: 'Ride Payment',
                order_id: orderData.order.id,
                handler: async function (response) {
                    try {
                        // Verify payment and finalize earning
                        const verifyRes = await fetch(`http://localhost:3000/ride/finalizeEarning/${rideId}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            credentials: 'include',
                            body: JSON.stringify({ paymentMethod: 'online' })
                        })

                        if (!verifyRes.ok) {
                            throw new Error('Payment verification failed')
                        }

                        alert('Payment successful!')
                        navigate(`/rider/request`)
                    } catch (error) {
                        console.error('Verification error:', error)
                        alert('Payment verification failed. Please contact support.')
                    }
                },
                prefill: {
                    name: ride?.rider?.firstName + ' ' + ride?.rider?.lastName,
                    email: ride?.rider?.emailId,
                    contact: ride?.rider?.phoneNumber
                },
                theme: {
                    color: '#667eea'
                },
                modal: {
                    ondismiss: function () {
                        setProcessing(false)
                    }
                }
            }

            const razorpay = new window.Razorpay(options)
            razorpay.open()
            setProcessing(false)

        } catch (error) {
            console.error('Razorpay error:', error)
            alert('Failed to initiate payment. Please try again.')
            setProcessing(false)
        }
    }

    if (loading) {
        return (
            <div className="payment-loading">
                <div className="spinner"></div>
                <p>Loading payment details...</p>
            </div>
        )
    }

    if (error || !ride) {
        return (
            <div className="payment-error">
                <p>{error || 'Ride not found'}</p>
                <button onClick={() => navigate('/rider/request')}>Go Back</button>
            </div>
        )
    }

    return (
        <div className="payment-page">
            <div className="payment-container">
                <div className="payment-header">
                    <div className="success-badge">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="#4caf50" strokeWidth="2" />
                            <path d="M8 12l3 3 5-5" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h1>Trip Completed!</h1>
                    <p className="header-subtitle">Choose your payment method</p>
                </div>

                <div className="fare-display">
                    <div className="fare-label">Total Fare</div>
                    <div className="fare-amount">₹{ride.actualFare}</div>
                </div>

                <div className="trip-summary">
                    <h3>Trip Summary</h3>
                    <div className="summary-item">
                        <span>From</span>
                        <span>{ride.pickupLocation}</span>
                    </div>
                    <div className="summary-item">
                        <span>To</span>
                        <span>{ride.dropLocation}</span>
                    </div>
                    <div className="summary-item">
                        <span>Distance: </span>
                        <span>{ride.distance?.toFixed(1)} km</span>
                    </div>
                    <div className="summary-item">
                        <span>Vehicle</span>
                        <span>{ride.vehicleType}</span>
                    </div>
                </div>

                <div className="payment-methods">
                    <h3>Select Payment Method</h3>

                    <button
                        className="payment-method-btn online"
                        onClick={handleRazorpayPayment}
                        disabled={processing}
                    >
                        <div className="method-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                <line x1="1" y1="10" x2="23" y2="10" />
                            </svg>
                        </div>
                        <div className="method-details">
                            <div className="method-title">Pay Online</div>
                            <div className="method-desc">UPI, Card, NetBanking</div>
                        </div>
                        <div className="method-arrow">→</div>
                    </button>

                    <button
                        className="payment-method-btn cash"
                        onClick={handleCashPayment}
                        disabled={processing}
                    >
                        <div className="method-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="1" x2="12" y2="23" />
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </div>
                        <div className="method-details">
                            <div className="method-title">Pay with Cash</div>
                            <div className="method-desc">Pay driver directly</div>
                        </div>
                        <div className="method-arrow">→</div>
                    </button>
                </div>

                {processing && (
                    <div className="processing-overlay">
                        <div className="spinner"></div>
                        <p>Processing payment...</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default RidePayment