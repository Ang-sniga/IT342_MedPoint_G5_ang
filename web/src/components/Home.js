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
          <h1>Welcome to Medpoint</h1>
          <p>Your trusted medical appointment management system</p>
          
          <div className="hero-buttons">
            <button
              className="hero-button primary"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button
              className="hero-button secondary"
              onClick={() => navigate('/register')}
            >
              Create Account
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
        <h2>Why Choose Medpoint?</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Easy Scheduling</h3>
            <p>Book appointments with ease. Manage your medical visits efficiently.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏥</div>
            <h3>Clinic Management</h3>
            <p>For clinic staff: Manage schedules, patient records, and reports.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Your medical information is protected with advanced security measures.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Role-Based Access</h3>
            <p>Different dashboards for patients and clinic staff with relevant features.</p>
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
