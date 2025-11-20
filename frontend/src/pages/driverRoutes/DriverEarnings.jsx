import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import '../../styles/driver/driverEarnings.css'

const DriverEarnings = () => {
  const user = useSelector((store) => store.user)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState(false)

  useEffect(() => {
    fetchDriverData()
  }, [])

  const fetchDriverData = async () => {
    try {
      setLoading(true)
      
      // Fetch driver profile
      const profileRes = await fetch('http://localhost:3000/driver/getProfile', {
        credentials: 'include'
      })

      if (!profileRes.ok) throw new Error('Failed to fetch profile')
      const profileData = await profileRes.json()
    console.log("profileData: ", profileData)
      setProfile(profileData)


    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!profile?.availableBalance || profile.availableBalance <= 0) {
      alert('No balance available to withdraw')
      return
    }

    if (!profile?.razorpayFundAccountId) {
      alert('Please add your bank details first')
      return
    }

    if (!window.confirm(`Withdraw ₹${profile.availableBalance.toFixed(2)}?`)) {
      return
    }

    try {
      setWithdrawing(true)
      const res = await fetch('http://localhost:3000/driver/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: profile.availableBalance
        })
      })

      if (!res.ok) throw new Error('Withdrawal failed')

      alert('Withdrawal request submitted successfully!')
      fetchDriverData()
    } catch (error) {
      console.error('Withdrawal error:', error)
      alert('Withdrawal failed. Please try again.')
    } finally {
      setWithdrawing(false)
    }
  }

  const calculateCommission = (totalEarnings) => {
    const commissionRate = 0.10 // 10%
    const gstRate = 0.18 // 18%
    const commission = totalEarnings * commissionRate
    const gst = commission * gstRate
    const totalCut = commission + gst
    return {
      commission: commission.toFixed(2),
      gst: gst.toFixed(2),
      totalCut: totalCut.toFixed(2),
      netEarnings: (totalEarnings - totalCut).toFixed(2)
    }
  }

  if (loading) {
    return (
      <div className="earnings-loading">
        <div className="spinner"></div>
        <p>Loading earnings...</p>
      </div>
    )
  }

  const breakdown = calculateCommission(profile?.totalEarnings || 0)

  return (
    <div className="earnings-page">
      <div className="earnings-container">
        <h1 className="page-title">My Earnings</h1>

        {/* Wallet Balances */}
        <div className="balance-cards">
          <div className="balance-card available">
            <div className="balance-header">
              <span className="balance-label">Available Balance</span>
              <div className="balance-icon">💰</div>
            </div>
            <div className="balance-amount">
              ₹{profile?.availableBalance?.toFixed(2) || '0.00'}
            </div>
            <p className="balance-desc">Ready to withdraw</p>
          </div>

          <div className="balance-card pending">
            <div className="balance-header">
              <span className="balance-label">Pending Balance</span>
              <div className="balance-icon">⏳</div>
            </div>
            <div className="balance-amount pending-amount">
              ₹{Math.abs(profile?.pendingBalance || 0).toFixed(2)}
            </div>
            <p className="balance-desc">
              {profile?.pendingBalance < 0 ? 'Amount owed to platform' : 'Processing'}
            </p>
          </div>

          <div className="balance-card total">
            <div className="balance-header">
              <span className="balance-label">Total Earnings</span>
              <div className="balance-icon">📊</div>
            </div>
            <div className="balance-amount">
              ₹{profile?.totalEarnings?.toFixed(2) || '0.00'}
            </div>
            <p className="balance-desc">Lifetime earnings</p>
          </div>
        </div>

        {/* Bank Details Status */}
        {!profile?.razorpayFundAccountId && (
          <div className="bank-warning">
            <span>⚠️</span>
            <div>
              <strong>Bank details required</strong>
              <p>Add your bank details to withdraw money</p>
            </div>
            <button onClick={() => window.location.href = '/driver/profile'}>
              Add Now
            </button>
          </div>
        )}

        {/* Withdraw Button */}
        {profile?.availableBalance > 0 && profile?.razorpayFundAccountId && (
          <button 
            className="withdraw-btn"
            onClick={handleWithdraw}
            disabled={withdrawing}
          >
            {withdrawing ? 'Processing...' : `Withdraw ₹${profile.availableBalance.toFixed(2)}`}
          </button>
        )}

        {/* Stats Cards */}
        <div className="stats-section">
          <h2>Overview</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">🚗</div>
              <div className="stat-content">
                <div className="stat-value">{profile?.completedRides?.length || 0}</div>
                <div className="stat-label">Completed Rides</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">💵</div>
              <div className="stat-content">
                <div className="stat-value">₹{profile?.totalEarnings?.toFixed(2) || '0.00'}</div>
                <div className="stat-label">Total Earned</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">📍</div>
              <div className="stat-content">
                <div className="stat-value">{profile?.status || 'offline'}</div>
                <div className="stat-label">Status</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">🎂</div>
              <div className="stat-content">
                <div className="stat-value">{profile?.age || 'N/A'}</div>
                <div className="stat-label">Age</div>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="breakdown-section">
          <h2>Earnings Breakdown</h2>
          <div className="breakdown-card">
            <div className="breakdown-item">
              <span className="breakdown-label">Gross Earnings</span>
              <span className="breakdown-value">₹{profile?.totalEarnings?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Platform Commission (10%)</span>
              <span className="breakdown-value negative">
                -₹{breakdown.commission}
              </span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">GST (18% on commission)</span>
              <span className="breakdown-value negative">
                -₹{breakdown.gst}
              </span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Total Deductions</span>
              <span className="breakdown-value negative">
                -₹{breakdown.totalCut}
              </span>
            </div>
            <div className="breakdown-item total-row">
              <span className="breakdown-label">Net Earnings</span>
              <span className="breakdown-value">
                ₹{breakdown.netEarnings}
              </span>
            </div>
          </div>
        </div>

        {/* Bank Details Display */}
        {profile?.bankDetails?.accountNumber && (
          <div className="bank-details-section">
            <h2>Bank Details</h2>
            <div className="bank-details-card">
              <div className="bank-detail-item">
                <span className="bank-label">Bank Name</span>
                <span className="bank-value">{profile.bankDetails.bankName}</span>
              </div>
              <div className="bank-detail-item">
                <span className="bank-label">Branch</span>
                <span className="bank-value">{profile.bankDetails.branchName}</span>
              </div>
              <div className="bank-detail-item">
                <span className="bank-label">Account Number</span>
                <span className="bank-value">••••{String(profile.bankDetails.accountNumber).slice(-4)}</span>
              </div>
              <div className="bank-detail-item">
                <span className="bank-label">IFSC Code</span>
                <span className="bank-value">{profile.bankDetails.IFSCcode}</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Info */}
        <div className="payment-info">
          <h3>💡 Payment Information</h3>
          <ul>
            <li>
              <strong>Cash Rides:</strong> Amount is deducted from your pending balance
            </li>
            <li>
              <strong>Online Rides:</strong> Amount is credited to available balance after commission
            </li>
            <li>
              <strong>Withdrawal:</strong> Available balance can be withdrawn to your bank account
            </li>
            <li>
              <strong>Pending Balance:</strong> {profile?.pendingBalance < 0 
                ? 'Clear this amount before making withdrawals' 
                : 'Will be credited after verification'}
            </li>
            <li>
              <strong>Razorpay Integration:</strong> Your account is {profile?.razorpayContactId ? 'linked' : 'not linked'}
            </li>
          </ul>
        </div>

        {/* Account Status */}
        <div className="verification-status">
          <h3>Account Verification</h3>
          <div className="status-items">
            <div className={`status-item ${profile?.isEmailVerified ? 'verified' : 'unverified'}`}>
              {profile?.isEmailVerified ? '✓' : '✗'} Email Verified
            </div>
          
            <div className={`status-item ${profile?.isVerified ? 'verified' : 'unverified'}`}>
              {profile?.isVerified ? '✓' : '✗'} Account Verified
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DriverEarnings