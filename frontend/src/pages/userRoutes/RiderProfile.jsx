import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import '../../styles/user/riderProfile.css'
import '../../styles/driver/driverProfile.css'
import { addUser, updateUser } from '../../utils/Redux/userSlice'

const RiderProfile = () => {
  const user = useSelector((store) => store.user)
  const dispatch = useDispatch()

  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')
  const [ratings, setRatings] = useState(0)
  const [showVerifyInput, setShowVerifyInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // 'personal', 'vehicle', 'bank', 'password'
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phoneNumber: user?.phoneNumber ?? '',
    emailId: user?.emailId ?? '',
    image: user?.image ?? '',
    age: user?.age ?? '',
    // Password
    password: '',
    newPassword: '',
    confirmNewPassword: ''
  })

  useEffect(() => {
    fetchProfile()
    fetchRatings()
  }, [])

  const fetchRatings = async () => {
    try {
      const res = await fetch('http://localhost:3000/user/getRatings', {
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Failed to fetch ratings')
      const data = await res.json()

      console.log('Fetched ratings:', data)
      if(data.averageRating){
        setRatings(data.averageRating)
      }
    } catch (error) {
      console.error('Error fetching ratings:', error)
      throw error
    }
  }  

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await fetch('http://localhost:3000/user/getProfile', {
        credentials: 'include'
      })

      if (!res.ok) throw new Error('Failed to fetch profile')

      const data = await res.json()
      setProfile(data)
      console.log('Fetched profile:', data)

      // Initialize form data
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phoneNumber: data.phoneNumber || '',
        emailId: data.emailId || '',
        age: data.age || 0,
        image: data.image || '',
      })


    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };

  const handlePersonalSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    // console.log("Submitting form data:", JSON.stringify(formData))
    try {

      const listedKeys = ['image', 'firstName', 'lastName', 'phoneNumber', 'age', 'emailId']
      const payload = {};
      for (const key in formData) {
        if (formData[key] !== '' && formData[key] !== user[key]) {
          if (listedKeys.includes(key)) {
            payload[key] = formData[key];
          }
          // payload[key] = formData[key];
        }
      }

      // Handle image upload separately if it’s a file
      const formDataToSend = new FormData();
      for (const key in payload) {
        if (payload[key] instanceof File) {
          console.log("key: ", key)
          formDataToSend.append('image', payload[key]);
          continue;
        } else {
          formDataToSend.append(key, payload[key]);
        }
      }

      const res = await fetch('http://localhost:3000/user/updateProfile', {
        method: 'PATCH',
        credentials: 'include',
        body: formDataToSend
      })

      if (!res.ok) {
        console.log("error: ", res)
        throw new Error('Update failed')
      }

      const data = await res.json()
      console.log("data: ", data)
      dispatch(updateUser(data))
      setProfile(data)
      setEditing(null)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Update error:', error)
      alert('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setEditing(null)
    fetchProfile()
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    )
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

        <div className="driver-profile-header">
          <div className="driver-profile-avatar-large">
            {profile?.image ? (
              <img src={`${profile.image}`} alt="Profile" />
            ) : (
              <span>{profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}</span>
            )}
          </div>
          <h2>{profile?.firstName} {profile?.lastName}</h2>
          <p className="driver-profile-role">User</p>
          {/* <div className="driver-stats-row">
            <div className="stat-badge">
              <span className="stat-value">⭐ {profile?.rating?.toFixed(1) || '0.0'}</span>
              <span className="stat-label">Rating</span>
            </div>
            <div className="stat-badge">
              <span className="stat-value">🚗 {profile?.completedRides.length || 0}</span>
              <span className="stat-label">Rides</span>
            </div>
          </div> */}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="profile-form-card">
          <div className="section-header">
            <h3>Personal Information</h3>
            {editing !== 'personal' && (
              <button className="edit-icon-btn" onClick={() => setEditing('personal')}>
                ✏️
              </button>
            )}
          </div>

          {editing === 'personal' ? (
            <form onSubmit={handlePersonalSubmit} className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className='form-row'>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>


              <div className="form-group">
                <label>Email Id</label>
                <input
                  type="email"
                  value={profile?.emailId}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Profile Image</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={cancelEdit}>
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Name</span>
                <span className="info-value">{profile?.firstName} {profile?.lastName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Age</span>
                <span className="info-value">{profile?.age}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{profile?.emailId}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone Number</span>
                <span className="info-value">{profile?.phoneNumber}</span>
              </div>

            </div>
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
              <span className="stat-value">{ratings.toFixed(1) || '0.0'}</span>
              <span className="stat-label">Rating</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RiderProfile