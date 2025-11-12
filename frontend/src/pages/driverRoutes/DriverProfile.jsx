import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import '../../styles/driver/driverProfile.css'
import { addUser, updateUser } from '../../utils/Redux/userSlice'

const DriverProfile = () => {
  const user = useSelector((store) => store.user)
  const dispatch = useDispatch()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // 'personal', 'vehicle', 'bank', 'password'
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    // Personal
    firstName: '',
    lastName: '',
    phoneNumber: '',
    age: 0,
    image: null,
    drivingLicence: null,
    // Vehicle
    vehicleType: '',
    vehicleName: '',
    vehicleNumber: '',
    vehicleColor: '',
    vehicleModel: '',
    vehicleImage: null,
    vehicleRC: null,
    vehicleInsurance: null,
    // Bank
    accountNumber: '',
    ifscCode: '',
    type: '',
    // Password
    password: '',
    newPassword: '',
    confirmNewPassword: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await fetch('http://localhost:3000/driver/getProfile', {
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
        age: data.age || 0,
        vehicleType: data.vehicle?.vehicleType || '',
        vehicleName: data.vehicle?.vehicleName || '',
        vehicleNumber: data.vehicle?.vehicleNumber || '',
        vehicleColor: data.vehicle?.vehicleColor || '',
        vehicleModel: data.vehicle?.vehicleModel || '',
        vehicleImage: data.vehicle?.vehicleImage || null,
        vehicleRC: data.vehicle?.vehicleRC || null,
        vehicleInsurance: data.vehicle?.vehicleInsurance || null,
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

    try {
      const listedKeys = ['image', 'drivingLicence', 'firstName', 'lastName', 'phoneNumber', 'age']
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
          formDataToSend.append('files', payload[key]);
          continue;
        } else {
          formDataToSend.append(key, payload[key]);
        }
      }
      console.log("payload: ", payload)
      // if (formData.vehicleInsurance) {
      //   formDataObj.append('files', formData.vehicleInsurance)
      // }

      const res = await fetch('http://localhost:3000/driver/updateProfile', {
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

  const handleVehicleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const listedKeys = ['vehicleImage', 'vehicleRC', 'vehicleInsurance', 'vehicleType', 'vehicleName', 'vehicleNumber', 'vehicleColor', 'vehicleModel']
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
          formDataToSend.append('files', payload[key]);
          continue;
        } else {
          formDataToSend.append(key, payload[key]);
        }
      }
      console.log("payload: ", payload)

      const res = await fetch('http://localhost:3000/driver/updateVehicle', {
        method: 'PATCH',
        credentials: 'include',
        body: formDataToSend
      })

      if (!res.ok) throw new Error('Update failed')

      const data = await res.json()
      setProfile(data)
      setEditing(null)
      alert('Vehicle details updated successfully!')
      fetchProfile()
    } catch (error) {
      console.error('Update error:', error)
      alert('Failed to update vehicle details')
    } finally {
      setSaving(false)
    }
  }

  const handleBankSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('http://localhost:3000/driver/updateBankDetails', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
        })
      })

      if (!res.ok) throw new Error('Update failed')

      const data = await res.json()
      setProfile(data)
      setEditing(null)
      alert('Bank details updated successfully!')
    } catch (error) {
      console.error('Update error:', error)
      alert('Failed to update bank details')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmNewPassword) {
      alert('New passwords do not match')
      return
    }

    setSaving(true)

    try {
      const res = await fetch('http://localhost:3000/driver/updatePassword', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          password: formData.password,
          newPassword: formData.newPassword,
          confirmNewPassword: formData.confirmNewPassword
        })
      })

      if (!res.ok) throw new Error('Password update failed')

      setEditing(null)
      setFormData({ ...formData, password: '', newPassword: '', confirmNewPassword: '' })
      alert('Password updated successfully!')
    } catch (error) {
      console.error('Password update error:', error)
      alert('Failed to update password')
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

  return (
    <div className="driver-profile-page">
      <div className="driver-profile-container">
        {/* Profile Header */}
        <div className="driver-profile-header">
          <div className="driver-profile-avatar-large">
            {profile?.image ? (
              <img src={`${profile.image}`} alt="Profile" />
            ) : (
              <span>{profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}</span>
            )}
          </div>
          <h2>{profile?.firstName} {profile?.lastName}</h2>
          <p className="driver-profile-role">Driver</p>
          <div className="driver-stats-row">
            <div className="stat-badge">
              <span className="stat-value">⭐ {profile?.rating?.toFixed(1) || '0.0'}</span>
              <span className="stat-label">Rating</span>
            </div>
            <div className="stat-badge">
              <span className="stat-value">🚗 {profile?.completedRides.length || 0}</span>
              <span className="stat-label">Rides</span>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="profile-section">
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
                <label>Email</label>
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

              <div className="form-group">
                <label>Driving Licence</label>
                <input
                  type="file"
                  name="drivingLicence"
                  accept="image/*,application/pdf"
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
              <div className="info-item">
                <span className="info-label">Driving Licence</span>
                <span className="info-value">
                  {profile?.drivingLicence ? (
                    <a href={`${profile.drivingLicence}`} target="_blank" rel="noreferrer">
                      View Document
                    </a>
                  ) : 'Not uploaded'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Vehicle Information */}
        <div className="profile-section">
          <div className="section-header">
            <h3>Vehicle Information</h3>
            {editing !== 'vehicle' && (
              <button className="edit-icon-btn" onClick={() => setEditing('vehicle')}>
                ✏️
              </button>
            )}
          </div>

          {editing === 'vehicle' ? (
            <form onSubmit={handleVehicleSubmit} className="edit-form">
              <div className="form-group">
                <label>Vehicle Type</label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select type</option>
                  <option value="bike lite">Bike Lite</option>
                  <option value="bike">Bike</option>
                  <option value="auto">Auto</option>
                  <option value="cab economy">Cab Economy</option>
                  <option value="cab premium">Cab Premium</option>
                  <option value="cab xl">Cab XL</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Vehicle Name</label>
                  <input
                    type="text"
                    name="vehicleName"
                    value={formData.vehicleName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Vehicle Color</label>
                  <input
                    type="text"
                    name="vehicleColor"
                    value={formData.vehicleColor}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className='form-row'>

                <div className="form-group">
                  <label>Vehicle Number</label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Vehicle Model</label>
                  <input
                    type="text"
                    name="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Vehicle Image</label>
                <input
                  type="file"
                  name="vehicleImage"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <div className="form-group">
                <label>Vehicle RC</label>
                <input
                  type="file"
                  name="vehicleRC"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                />
              </div>

              <div className="form-group">
                <label>Vehicle Insurance</label>
                <input
                  type="file"
                  name="vehicleInsurance"
                  accept="image/*,application/pdf"
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
              {profile?.vehicle?.vehicleImage && (
                <div className="vehicle-image-preview">
                  <img
                    src={`${profile.vehicle.vehicleImage}`}
                    alt="Vehicle"
                  />
                </div>
              )}
              <div className="info-item">
                <span className="info-label">Vehicle Type</span>
                <span className="info-value">{profile?.vehicle?.vehicleType || 'Not set'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Vehicle Name</span>
                <span className="info-value">{profile?.vehicle?.vehicleName || 'Not set'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Vehicle Number</span>
                <span className="info-value">{profile?.vehicle?.vehicleNumber || 'Not set'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Vehicle Color</span>
                <span className="info-value">{profile?.vehicle?.vehicleColor || 'Not set'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">RC Document</span>
                <span className="info-value">
                  {profile?.vehicle?.vehicleRC ? (
                    <a href={`${profile.vehicle.vehicleRC}`} target="_blank" rel="noreferrer">
                      View Document
                    </a>
                  ) : 'Not uploaded'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Insurance</span>
                <span className="info-value">
                  {profile?.vehicle?.vehicleInsurance ? (
                    <a href={`${profile.vehicle.vehicleInsurance}`} target="_blank" rel="noreferrer">
                      View Document
                    </a>
                  ) : 'Not uploaded'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bank Details */}
        <div className="profile-section">
          <div className="section-header">
            <h3>Bank Details</h3>
            {editing !== 'bank' && (
              <button className="edit-icon-btn" onClick={() => setEditing('bank')}>
                ✏️
              </button>
            )}
          </div>

          {editing === 'bank' ? (
            <form onSubmit={handleBankSubmit} className="edit-form">

              <div className="form-group">
                <label>Account Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select type</option>
                  <option value="bank_account">Bank Account</option>
                  <option value="vpa">UPI</option>
                </select>
              </div>
              {formData.type === 'bank_account' &&
                <>
                  <div className="form-group">
                    <label>Account Number</label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>IFSC Code</label>
                    <input
                      type="text"
                      name="ifscCode"
                      value={formData.ifscCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </>
              }

              {/* <div className="form-group">
                <label>Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  required
                />
              </div> */}

              {formData.type === 'vpa' &&
                <>
                  <div className="form-group">
                    <label>UPI Address</label>
                    <input
                      type="text"
                      name="vpaAddress"
                      value={formData.vpaAddress}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </>
              }

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={cancelEdit}>
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={saving || !formData.type}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="info-grid">

              <div className="info-item">
                <span className="info-label">Payment Id: </span>
                <span className="info-value">{profile?.razorpayContactId || 'Not set'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Fund Account Id</span>
                <span className="info-value">{profile?.razorpayFundAccountId || 'Not set'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="profile-section">
          <div className="section-header">
            <h3>Change Password</h3>
            {editing !== 'password' && (
              <button className="edit-icon-btn" onClick={() => setEditing('password')}>
                ✏️
              </button>
            )}
          </div>

          {editing === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="edit-form">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={cancelEdit}>
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={saving}>
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default DriverProfile