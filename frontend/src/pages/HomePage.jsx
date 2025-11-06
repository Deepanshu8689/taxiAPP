import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/homepage.css'

const HomePage = () => {
  const navigate = useNavigate()

  return (
    <div className="homepage">
      <div className="hero-section">
        <div className="hero-content">
          <div className="logo">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <path d="M5 17h-.8C3.5 17 3 16.5 3 15.8V13c0-.6.4-1 1-1h1V7c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v5h1c.6 0 1 .4 1 1v2.8c0 .7-.5 1.2-1.2 1.2H19" 
                stroke="#ffc107" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="7" cy="17" r="2" stroke="#ffc107" strokeWidth="2"/>
              <circle cx="17" cy="17" r="2" stroke="#ffc107" strokeWidth="2"/>
            </svg>
          </div>

          <h1>Welcome to RideEase</h1>
          <p className="tagline">Your journey, our priority</p>
          
          <div className="features">
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <span>Quick Booking</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💰</div>
              <span>Best Prices</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🛡️</div>
              <span>Safe & Secure</span>
            </div>
          </div>

          <div className="auth-buttons">
            <button 
              className="btn-primary" 
              onClick={() => navigate('/')}
            >
              Sign Up
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => navigate('/login')}
            >
              Login
            </button>
          </div>

          <p className="bottom-text">Get started with your first ride today!</p>
        </div>
      </div>

      <div className="decorative-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
    </div>
  )
}

export default HomePage
