import { useEffect, useState } from 'react'
import '../../styles/admin/manageDrivers.css'

const ManageDrivers = () => {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, verified, pending, suspended
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchDrivers()
  }, [filter])

  const fetchDrivers = async () => {
    try {
      console.log(`Fetching drivers with filter: ${filter}`)
      setLoading(true)
      
      const res = await fetch(`http://localhost:3000/admin/allDrivers?verified=${filter}`, {
        credentials: 'include'
      })

      if (res.ok) {
        const data = await res.json()
        setDrivers(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching drivers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyDriver = async (driverId) => {
    if (!window.confirm('Are you sure you want to verify this driver?')) return

    try {
      const res = await fetch(`http://localhost:3000/admin/verifyDriver/${driverId}`, {
        method: 'PATCH',
        credentials: 'include'
      })

      if (res.ok) {
        alert('Driver verified successfully!')
        fetchDrivers()
      }
    } catch (error) {
      console.error('Error verifying driver:', error)
      alert('Failed to verify driver')
    }
  }

  const handleVerifyVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to verify this vehicle?')) return

    try {
      const res = await fetch(`http://localhost:3000/admin/verifyVehicle/${vehicleId}`, {
        method: 'PATCH',
        credentials: 'include'
      })

      if (res.ok) {
        alert('Vehicle verified successfully!')
        fetchDrivers()
      }
    } catch (error) {
      console.error('Error verifying vehicle:', error)
      alert('Failed to verify vehicle')
    }
  }

  const handleSuspendDriver = async (driverId) => {
    if (!window.confirm('Are you sure you want to suspend this driver?')) return

    try {
      const res = await fetch(`http://localhost:3000/admin/suspendDriver/${driverId}`, {
        method: 'PATCH',
        credentials: 'include'
      })

      if (res.ok) {
        alert('Driver suspended successfully!')
        fetchDrivers()
      }
    } catch (error) {
      console.error('Error suspending driver:', error)
      alert('Failed to suspend driver')
    }
  }

  const openDriverDetails = (driver) => {
    setSelectedDriver(driver)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedDriver(null)
  }

  if (loading) {
    return (
      <div className="manage-loading">
        <div className="spinner"></div>
        <p>Loading drivers...</p>
      </div>
    )
  }

  return (
    <div className="manage-drivers">
      <div className="manage-container">
        <div className="manage-header">
          <div>
            <h1>Manage Drivers</h1>
            <p>Verify and manage driver accounts</p>
          </div>
          <div className="header-stats">
            <div className="stat-pill">
              <span className="stat-number">{drivers.length}</span>
              <span className="stat-text">Total Drivers</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Drivers
          </button>
          <button 
            className={`filter-tab ${filter === 'verified' ? 'active' : ''}`}
            onClick={() => setFilter('verified')}
          >
            Verified
          </button>
          <button 
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`filter-tab ${filter === 'suspended' ? 'active' : ''}`}
            onClick={() => setFilter('suspended')}
          >
            Suspended
          </button>
        </div>

        {/* Drivers Grid */}
        {drivers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚗</div>
            <h3>No drivers found</h3>
            <p>No drivers match the current filter</p>
          </div>
        ) : (
          <div className="drivers-grid">
            {drivers.map((driver) => (
              <div key={driver._id} className="driver-card">
                <div className="driver-card-header">
                  <div className="driver-avatar-large">
                    {driver.firstName?.charAt(0)}{driver.lastName?.charAt(0)}
                  </div>
                  <div className="driver-info">
                    <h3>{driver.firstName} {driver.lastName}</h3>
                    <p className="driver-email">{driver.emailId}</p>
                    <p className="driver-phone">{driver.phoneNumber}</p>
                  </div>
                  <div className="verification-badges">
                    {driver.isVerified && (
                      <span className="badge verified">✓ Verified</span>
                    )}
                    {driver.isSuspended && (
                      <span className="badge suspended">Suspended</span>
                    )}
                    {!driver.isVerified && !driver.isSuspended && (
                      <span className="badge pending">Pending</span>
                    )}
                  </div>
                </div>

                <div className="driver-stats">
                  <div className="stat-item">
                    <span className="stat-label">Rides</span>
                    <span className="stat-value">{driver.completedRides?.length || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Earnings</span>
                    <span className="stat-value">₹{driver.totalEarnings?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Status</span>
                    <span className={`stat-value status-${driver.status}`}>
                      {driver.status || 'offline'}
                    </span>
                  </div>
                </div>

                {driver.vehicle && (
                  <div className="vehicle-info">
                    <h4>Vehicle Details</h4>
                    <div className="vehicle-details">
                      <p><strong>Type:</strong> {driver.vehicle.vehicleType}</p>
                      <p><strong>Model:</strong> {driver.vehicle.vehicleName}</p>
                      <p><strong>Number:</strong> {driver.vehicle.vehicleNumber}</p>
                      <p><strong>Color:</strong> {driver.vehicle.vehicleColor}</p>
                    </div>
                    {!driver.vehicle.isVehicleVerified && (
                      <button 
                        className="verify-btn small"
                        onClick={() => handleVerifyVehicle(driver.vehicle._id)}
                      >
                        Verify Vehicle
                      </button>
                    )}
                  </div>
                )}

                <div className="driver-actions">
                  <button 
                    className="action-btn view"
                    onClick={() => openDriverDetails(driver)}
                  >
                    View Details
                  </button>
                  {!driver.isVerified && !driver.isSuspended && (
                    <button 
                      className="action-btn verify"
                      onClick={() => handleVerifyDriver(driver._id)}
                    >
                      Verify Driver
                    </button>
                  )}
                  {driver.isVerified && !driver.isSuspended && (
                    <button 
                      className="action-btn suspend"
                      onClick={() => handleSuspendDriver(driver._id)}
                    >
                      Suspend
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Driver Details Modal */}
        {showModal && selectedDriver && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Driver Details</h2>
                <button className="close-btn" onClick={closeModal}>×</button>
              </div>

              <div className="modal-body">
                <div className="detail-section">
                  <h3>Personal Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Name</span>
                      <span className="detail-value">
                        {selectedDriver.firstName} {selectedDriver.lastName}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Email</span>
                      <span className="detail-value">{selectedDriver.emailId}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Phone</span>
                      <span className="detail-value">{selectedDriver.phoneNumber}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Age</span>
                      <span className="detail-value">{selectedDriver.age || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {selectedDriver.vehicle && (
                  <div className="detail-section">
                    <h3>Vehicle Information</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Type</span>
                        <span className="detail-value">{selectedDriver.vehicle.vehicleType}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Model</span>
                        <span className="detail-value">{selectedDriver.vehicle.vehicleName}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Number</span>
                        <span className="detail-value">{selectedDriver.vehicle.vehicleNumber}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Color</span>
                        <span className="detail-value">{selectedDriver.vehicle.vehicleColor}</span>
                      </div>
                    </div>

                    {selectedDriver.vehicle.vehicleImage && (
                      <div className="document-viewer">
                        <h4>Vehicle Image</h4>
                        <img 
                          src={`http://localhost:3000/${selectedDriver.vehicle.vehicleImage}`}
                          alt="Vehicle"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="detail-section">
                  <h3>Documents</h3>
                  <div className="documents-list">
                    {selectedDriver.drivingLicence && (
                      <a 
                        href={`http://localhost:3000/${selectedDriver.drivingLicence}`}
                        target="_blank"
                        rel="noreferrer"
                        className="document-link"
                      >
                        📄 Driving Licence
                      </a>
                    )}
                    {selectedDriver.vehicle?.vehicleRC && (
                      <a 
                        href={`http://localhost:3000/${selectedDriver.vehicle.vehicleRC}`}
                        target="_blank"
                        rel="noreferrer"
                        className="document-link"
                      >
                        📄 Vehicle RC
                      </a>
                    )}
                    {selectedDriver.vehicle?.vehicleInsurance && (
                      <a 
                        href={`http://localhost:3000/${selectedDriver.vehicle.vehicleInsurance}`}
                        target="_blank"
                        rel="noreferrer"
                        className="document-link"
                      >
                        📄 Vehicle Insurance
                      </a>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Verification Status</h3>
                  <div className="verification-grid">
                    <div className={`verify-item ${selectedDriver.isEmailVerified ? 'verified' : ''}`}>
                      {selectedDriver.isEmailVerified ? '✓' : '✗'} Email Verified
                    </div>
                    <div className={`verify-item ${selectedDriver.isPhoneVerified ? 'verified' : ''}`}>
                      {selectedDriver.isPhoneVerified ? '✓' : '✗'} Phone Verified
                    </div>
                    <div className={`verify-item ${selectedDriver.isVerified ? 'verified' : ''}`}>
                      {selectedDriver.isVerified ? '✓' : '✗'} Account Verified
                    </div>
                    <div className={`verify-item ${selectedDriver.vehicle?.isVehicleVerified ? 'verified' : ''}`}>
                      {selectedDriver.vehicle?.isVehicleVerified ? '✓' : '✗'} Vehicle Verified
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                {!selectedDriver.isVerified && (
                  <button 
                    className="modal-action-btn verify"
                    onClick={() => {
                      handleVerifyDriver(selectedDriver._id)
                      closeModal()
                    }}
                  >
                    Verify Driver
                  </button>
                )}
                {selectedDriver.isVerified && !selectedDriver.isSuspended && (
                  <button 
                    className="modal-action-btn suspend"
                    onClick={() => {
                      handleSuspendDriver(selectedDriver._id)
                      closeModal()
                    }}
                  >
                    Suspend Driver
                  </button>
                )}
                <button className="modal-action-btn cancel" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageDrivers