import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

const CompletedRide = () => {

  const user = useSelector((store) => store.user)
  const navigate = useNavigate()

  const rideId = useParams().rideId
  console.log("rideId: ", rideId)

  const verifyHandler = async () => {
    try {
      const res = await fetch(`http://localhost:3000/ride/finalizeEarning/${rideId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ paymentMethod: 'cash' })
      })

      if (!res.ok) {
        throw new Error('Payment processing failed')
      }

      await res.json()
      alert('Payment processed successfully!')
      navigate('/driver/home')

    } catch (error) {

    }
  }

  return (
    <div>
      <div>
        <button onClick={verifyHandler}>
          Verify Payment
        </button>
      </div>
    </div>
  )
}

export default CompletedRide
