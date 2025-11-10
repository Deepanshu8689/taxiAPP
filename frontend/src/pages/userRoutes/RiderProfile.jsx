import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import '../../styles/user/riderProfile.css'
import { addUser, updateUser } from '../../utils/Redux/userSlice'

const RiderProfile = () => {
  const user = useSelector((store) => store.user)
  const dispatch = useDispatch()

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [showVerifyInput, setShowVerifyInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phoneNumber: user?.phoneNumber ?? '',
    emailId: user?.emailId ?? '',
    image: user?.image ?? '',
    age: user?.age ?? ''
  })



  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // console.log("Submitting form data:", JSON.stringify(formData))
    try {

      const payload = {};
      for (const key in formData) {
        if (formData[key] !== '' && formData[key] !== user[key]) {
          payload[key] = formData[key];
        }
      }

      // Handle image upload separately if it’s a file
      const formDataToSend = new FormData();
      for (const key in payload) {
        formDataToSend.append(key, payload[key]);
      }

      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }

      const res = await fetch('http://localhost:3000/user/updateProfile', {
        method: 'PATCH',
        credentials: 'include',
        body: formDataToSend
      })

      const data = await res.json()
      console.log('Update response data:', data)
      dispatch(updateUser(data))

      if (!res.ok) {
        throw new Error(data.message || 'Update failed')
      }

      dispatch(addUser(data.user))
      setIsEditing(false)
      alert('Profile updated successfully!')

    } catch (error) {
      console.error('Update error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const cancelEdit = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
      emailId: user?.emailId || '',
      image: user?.image || '',
      age: user?.age || ''
    })
    setIsEditing(false)
    setError('')
  }

  const sendOtpHandler = async () => {
    setShowVerifyInput(true)
    try {
      const res = await fetch('http://localhost:3000/user/sendSms', {
        method: 'Post',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await res.json()
      console.log("saved OTP: ", data.savedOtp)

      if (data.savedOtp) {
        setShowVerifyInput(true)
      }

    } catch (error) {
      console.log("error in verifyHandler: ", error)
      throw error
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    try {

      const res = await fetch('http://localhost:3000/user/verifyPhone', {
        method: 'Post',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sms: otp })
      })

      if (!res.ok) {
        throw new Error("Invalid OTP")
      }

      const data = await res.json()

      if (data) {
        alert("Phone number verified")
      }

      dispatch(updateUser({ isPhoneVerified: true }))
      setShowVerifyInput(false)
      setVerifying(false)
      setOtp('')

    } catch (error) {
      console.log("error in handleVerifyOtp: ", error)
      throw error
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {user?.image ? (
              <img src={`http://localhost:3000/${user.image}`} alt="Profile" />
            ) : (
              <span>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</span>
            )}
          </div>
          <h2>{user?.firstName} {user?.lastName}</h2>
          <p className="profile-role">Rider</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="profile-form-card">
          {!isEditing ? (
            // View Mode
            <div className="profile-info">
              <div className="info-item">
                <span className="info-label">First Name</span>
                <span className="info-value">{user?.firstName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Name</span>
                <span className="info-value">{user?.lastName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Age</span>
                <span className="info-value">{user?.age}</span>
              </div>
              <div className="info-item">
                <span className="info-label">EmailId</span>
                <span className="info-value">{user?.emailId}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone Number</span>
                <span className="info-value">{user?.phoneNumber}</span>

                {user?.isPhoneVerified ? (
                  <span className="verified-badge">✅ Verified</span>
                ) : (
                  <div className="verify-container">
                    {(!showVerifyInput && !user?.isPhoneVerified) ? (
                      <button className="verify-btn" onClick={sendOtpHandler}>
                        Verify
                      </button>
                    ) : (
                      <div className="verify-input-wrapper">
                        <input
                          type="text"
                          placeholder="Enter OTP"
                          className="verify-input"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                        />
                        <button
                          className="verify-submit-btn"
                          onClick={handleVerifyOtp}
                          disabled={verifying}
                        >
                          {verifying ? "Verifying..." : "Submit"}
                        </button>
                        <button
                          className="verify-cancel-btn"
                          onClick={() => {
                            setShowVerifyInput(false);
                            setOtp("");
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            </div>
          ) : (
            // Edit Mode

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="image">Profile Image</label>
                <input
                  id="image"
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
              </div>
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="emailId">Email Id</label>
                <input
                  id="emailId"
                  type="email"
                  name="emailId"
                  value={formData.emailId}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  id="phoneNumber"
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="age">Age</label>
                <input
                  id="age"
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={cancelEdit}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="save-btn"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Account Stats */}
        <div className="account-stats">
          <div className="stat-card">
            <div className="stat-icon">🚗</div>
            <div className="stat-info">
              <span className="stat-value">{user.completedRides.length}</span>
              <span className="stat-label">Completed Rides</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <span className="stat-value">4.8</span>
              <span className="stat-label">Rating</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RiderProfile