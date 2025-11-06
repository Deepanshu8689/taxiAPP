import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import '../../styles/riderProfile.css'
import { addUser } from '../../utils/Redux/userSlice'

const RiderProfile = () => {
  const user = useSelector((store) => store.user)
  const dispatch = useDispatch()
  
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    emailId: user?.emailId || ''
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

    try {
      const res = await fetch('http://localhost:3000/user/updateProfile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await res.json()

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
      phone: user?.phone || '',
      emailId: user?.emailId || ''
    })
    setIsEditing(false)
    setError('')
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
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
                <span className="info-label">Email</span>
                <span className="info-value">{user?.emailId}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone</span>
                <span className="info-value">{user?.phone}</span>
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
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
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
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="emailId">Email</label>
                <input
                  id="emailId"
                  type="email"
                  name="emailId"
                  value={formData.emailId}
                  onChange={handleInputChange}
                  disabled
                />
                <small className="field-note">Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
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
              <span className="stat-value">12</span>
              <span className="stat-label">Total Rides</span>
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