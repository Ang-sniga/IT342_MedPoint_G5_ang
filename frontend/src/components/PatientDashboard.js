import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function PatientDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userString = localStorage.getItem('user');
    const userRole = localStorage.getItem('userRole');

    if (!userString || userRole !== '1') {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(userString);
    setUser(userData);
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-content">
          <h1 className="navbar-brand">Medpoint</h1>
          <div className="navbar-user">
            <span className="user-greeting">Welcome, {user?.name}!</span>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>Patient Dashboard</h2>
          <p>Account Type: {user?.role}</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>📋 My Appointments</h3>
            <p>View and schedule your medical appointments</p>
            <button className="card-button">View Appointments</button>
          </div>

          <div className="dashboard-card">
            <h3>🏥 Find Clinics</h3>
            <p>Search and find nearby clinics</p>
            <button className="card-button">Browse Clinics</button>
          </div>

          <div className="dashboard-card">
            <h3>📋 Medical Records</h3>
            <p>Access your medical records and prescriptions</p>
            <button className="card-button">View Records</button>
          </div>

          <div className="dashboard-card">
            <h3>👤 My Profile</h3>
            <p>View and edit your profile information</p>
            <button className="card-button">Edit Profile</button>
          </div>
        </div>

        <div className="user-info-section">
          <h3>Account Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <span>{user?.name}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{user?.email}</span>
            </div>
            <div className="info-item">
              <label>Account Type:</label>
              <span>{user?.role}</span>
            </div>
            <div className="info-item">
              <label>User ID:</label>
              <span>{user?.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;
