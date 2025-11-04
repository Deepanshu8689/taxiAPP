import React, { useContext, useEffect, useRef, useState } from 'react'
import { createSocketConnection } from '../socket'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const DriverPage = () => {
    const user = useSelector((store) => store.user)
    // const ride = useSelector((store) => store.ride)
    const socketRef = useRef(null)
    const [comingRide, setComingRide] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const socket = createSocketConnection()
        socketRef.current = socket

        socketRef.current.emit('register', user)
        socketRef.current.on('FE-new-ride', (ride) => {
            console.log("New ride coming:", ride);
            if (ride) {
                setComingRide(ride)
            }
        })

        socketRef.current.on('FE-driver-accepted', (ride) => {
            if(!ride){
                setComingRide(null)
                throw new Error('Ride not found')
            }
            else{
                setComingRide(ride)
                navigate('/driver-dashboard')
            }
        })

        socketRef.current.on('FE-driver-rejected', () => {
            setComingRide(null)
        })

    }, [user])

    const locationHandler = async () => {
        // e.preventDefault()
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

                    await res.json()
                }
            )
        } catch (error) {
            console.log("error in locationHandler: ", error)
            throw error
        }
    }

    const handleAcceptRide = async (id) => {
        try {

            // locationHandler()

            const res = await fetch(`http://localhost:3000/ride/acceptRide/${id}`, {
                method: "Post",
                credentials: "include"
            })

            const data = await res.json();
            console.log("data: ", data)
            if (!res.ok) throw new Error(data.message || "Ride request failed")
            
            socketRef.current.emit('BE-ride-accept', data.updatedRide)
            alert("Ride accepted successfully")

        } catch (error) {
            console.log("error in handleAcceptRide: ", error)
            throw error
        }
    }



    const logoutHandler = async (e) => {
        e.preventDefault();
        try {

            const res = await fetch("http://localhost:3000/auth/logout", {
                method: "Post"
            })

            setUser(null)
            navigate('/')

        } catch (error) {
            console.log("error in logoutHandler: ", error)
            throw error
        }
    }
    

    return (
        <div className="driver-dashboard">
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

                <button onClick={() => navigate('/driver-dashboard')}>
                    Dashboard
                </button>

            </div>
            <h1 className="dashboard-title">Upcoming Rides</h1>

            {comingRide === null ? (
                <p className="no-rides">No upcoming rides.</p>
            ) : (
                <div className="rides-container">
                    <div className="ride-card">
                        <div className="ride-header">
                            <h2 className="pickup">{comingRide.pickupLocation}</h2>
                            <span className={`ride-status ${comingRide.status}`}>
                                {comingRide.status.toUpperCase()}
                            </span>
                        </div>

                        <p><strong>Drop:</strong> {comingRide.dropLocation}</p>
                        <p><strong>Fare:</strong> ₹{comingRide.estimatedFare}</p>

                        <div className="ride-actions">
                            {comingRide.status === "requested" && (
                                <div>
                                    <button
                                        onClick={() => handleAcceptRide(comingRide._id)}
                                        className="btn start"
                                    >
                                        Accept Ride
                                    </button>
                                    <button
                                        onClick={() => setComingRide(null)}
                                        className="btn start"
                                    >
                                        Ignore Ride
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DriverPage
