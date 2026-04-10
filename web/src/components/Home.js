import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <nav className="home-navbar">
        <h1 className="logo">Medpoint</h1>
        <div className="nav-buttons">
          <button
            className="nav-button login-btn"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button
            className="nav-button register-btn"
            onClick={() => navigate('/register')}
          >
            Register
          </button>
        </div>
      </nav>

      <div className="hero-section">
        <div className="hero-content">
          <h1>Book Your General Check-up in Minutes</h1>
          <p>Sign up, choose a doctor, pick your schedule, and confirm instantly.</p>
          
          <div className="hero-buttons">
            <button
              className="hero-button primary"
              onClick={() => navigate('/register')}
            >
              Start Booking
            </button>
            <button
              className="hero-button secondary"
              onClick={() => navigate('/login')}
            >
              I Already Have an Account
            </button>
          </div>
        </div>

        <div className="hero-image">
          <div className="image-placeholder">
            🏥
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>First-time Patient Booking Journey</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">1</div>
            <h3>Create Your Account</h3>
            <p>Open Medpoint, tap Sign Up, and create your patient profile.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">2</div>
            <h3>Login and Choose Doctor</h3>
            <p>Sign in and select your preferred doctor for fever or sickness check-up.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">3</div>
            <h3>Pick Date and Time</h3>
            <p>Choose the best available schedule and add your symptoms as notes.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">4</div>
            <h3>Confirm and Track</h3>
            <p>Confirm appointment and instantly see booking confirmation in your dashboard list.</p>
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2026 Medpoint. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
