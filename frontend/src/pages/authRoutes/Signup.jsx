import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addUser } from '../../utils/Redux/userSlice';
import '../../styles/auth/auth.css';
import { toast } from 'react-toastify';

const Signup = () => {
  const [step, setStep] = useState(1); // 1: phone, 2: otp, 3: details
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);
  const [role, setRole] = useState('user'); // 'user' or 'driver'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSendOTP = async () => {
    setError('');
    
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: "+91"+phone }),
        credentials: 'include'
      });

      const data = await response.json();
      console.log("data: ", data)
      
      if (response.ok) {
        toast.success(data.message)
        setStep(2);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: "+91"+phone, otp }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (response.ok) {
        setStep(3);
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSignup = async () => {
    setError('');

    if (!firstName || !lastName || !email || !role || !age) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: "+91"+phone,
          firstName,
          lastName,
          emailId: email,
          role,
          age
        }),
        credentials: 'include'
      });

      const data = await response.json();
      console.log("usr in signup: ", data)
      
      if (response.ok) {
        toast.success("Signup successful! Login to continue")
        navigate('/login');
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="auth-logo">
            <path d="M5 17h-.8C3.5 17 3 16.5 3 15.8V13c0-.6.4-1 1-1h1V7c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v5h1c.6 0 1 .4 1 1v2.8c0 .7-.5 1.2-1.2 1.2H19"
              stroke="#667eea" strokeWidth="2" strokeLinecap="round" />
            <circle cx="7" cy="17" r="2" stroke="#667eea" strokeWidth="2" />
            <circle cx="17" cy="17" r="2" stroke="#667eea" strokeWidth="2" />
          </svg>
          <h1>Create Account</h1>
          <p>Join us and start your journey</p>
        </div>

        <div className="signup-steps">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-circle">1</div>
            <span>Phone</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-circle">2</div>
            <span>Verify</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-circle">3</div>
            <span>Details</span>
          </div>
        </div>

        {error && (
          <div className="auth-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {step === 1 && (
          <div className="auth-form">
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="phone-input">
                <span className="country-code">+91</span>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit number"
                  disabled={loading}
                />
              </div>
            </div>

            <button onClick={handleSendOTP} className="auth-button" disabled={loading}>
              {loading ? <span className="loading-spinner"></span> : 'Send OTP'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="auth-form">
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit OTP"
                disabled={loading}
                className="otp-input"
              />
              <p className="otp-hint">OTP sent to +91 {phone}</p>
            </div>

            <button onClick={handleVerifyOTP} className="auth-button" disabled={loading}>
              {loading ? <span className="loading-spinner"></span> : 'Verify OTP'}
            </button>

            <button
              onClick={() => {
                setStep(1);
                setOtp('');
                setError('');
              }}
              className="auth-button-secondary"
              disabled={loading}
            >
              Change Number
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="auth-form">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="age">Age *</label>
              <input
                type="number"
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">EmailId (Optional)</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Select Role *</label>
              <div className="role-selector">
                <button
                  className={`role-card ${role === 'user' ? 'selected' : ''}`}
                  onClick={() => setRole('user')}
                  disabled={loading}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <h3>Rider</h3>
                  <p>Book rides</p>
                </button>

                <button
                  className={`role-card ${role === 'driver' ? 'selected' : ''}`}
                  onClick={() => setRole('driver')}
                  disabled={loading}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  <h3>Driver</h3>
                  <p>Earn money</p>
                </button>
              </div>
            </div>

            <button onClick={handleCompleteSignup} className="auth-button" disabled={loading}>
              {loading ? <span className="loading-spinner"></span> : 'Complete Signup'}
            </button>
          </div>
        )}

        <div className="auth-footer">
          <p>Already have an account?</p>
          <Link to="/login" className="auth-link">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;