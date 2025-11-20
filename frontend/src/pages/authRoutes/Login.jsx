import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addUser } from '../../utils/Redux/userSlice';
import '../../styles/auth/auth.css';
import { toast } from 'react-toastify';

const Login = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');

        if (phoneNumber.length !== 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: "+91" + phoneNumber }),
                credentials: 'include'
            });

            const data = await response.json();
            console.log("data: ", data)
            if (response.ok) {
                toast.success(data.message)
                setOtpSent(true);
            } else {
                toast.error(data.message)
                setError(data.message || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
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
                body: JSON.stringify({ phoneNumber: "+91" + phoneNumber, otp }),
                credentials: 'include'
            });


            if (!response.ok) {
                toast.error(data.message)
                setError(data.message)
                return
            }

            const res = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: "+91" + phoneNumber, otp }),
                credentials: 'include'
            });

            const data = await res.json();
            console.log("data: ", data)
            if (!res.ok) {
                toast.error(data.message)
                setError(data.message)
                return
            }
            console.log("after login: ", data.user)
            dispatch(addUser(data.user));
            // Redirect based on role
            if (data.user.role === 'admin') {
                navigate('/admin');
            } else if (data.user.role === 'driver') {
                navigate('/driver');
            } else {
                navigate('/rider');
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
                    <h1>Welcome Back</h1>
                    <p>Login to continue your ride</p>
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

                {!otpSent ? (
                    <div className="auth-form">
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <div className="phone-input">
                                <span className="country-code">+91</span>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="Enter 10-digit number"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button onClick={handleSendOTP} className="auth-button" disabled={loading}>
                            {loading ? (
                                <span className="loading-spinner"></span>
                            ) : (
                                'Send OTP'
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="auth-form">
                        <div className="form-group">
                            <label htmlFor="otp">Enter OTP</label>
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="6-digit OTP"
                                required
                                disabled={loading}
                                className="otp-input"
                            />
                            <p className="otp-hint">OTP sent to +91 {phoneNumber}</p>
                        </div>

                        <button onClick={handleVerifyOTP} className="auth-button" disabled={loading}>
                            {loading ? (
                                <span className="loading-spinner"></span>
                            ) : (
                                'Verify & Login'
                            )}
                        </button>

                        <button
                            onClick={() => {
                                setOtpSent(false);
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

                <div className="auth-footer">
                    <p>Don't have an account?</p>
                    <Link to="/signup" className="auth-link">Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;