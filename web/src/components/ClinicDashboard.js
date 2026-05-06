import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roleNavigationStrategy } from '../services/roleNavigationStrategy';
import './Dashboard.css';
import ClinicStaffPanel from './ClinicStaffPanel';

function ClinicDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userString = localStorage.getItem('user');
    const userRole = localStorage.getItem('userRole');

     if (!userString || !roleNavigationStrategy.canAccessDashboard(userRole, roleNavigationStrategy.roleIds.clinicStaff)) {
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
          <h2>Clinic Staff Dashboard</h2>
          <p>Account Type: {user?.role}</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>🗓️ Schedule Management</h3>
            <p>Manage doctor schedules and appointments</p>
            <button className="card-button" onClick={() => navigate('/clinic/schedules')}>Manage Schedule</button>
          </div>

          <div className="dashboard-card">
            <h3>👥 Patient Management</h3>
            <p>View approved appointments and patient records</p>
            <button className="card-button" onClick={() => navigate('/clinic/patients')}>View Patients</button>
          </div>

          <div className="dashboard-card">
            <h3>📄 Reports</h3>
            <p>View pending appointments for review</p>
            <button className="card-button" onClick={() => navigate('/clinic/reports')}>View Reports</button>
          </div>
        </div>

        <ClinicStaffPanel />

        <div className="user-info-section">
          <h3>Staff Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Staff Name:</label>
              <span>{user?.name}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{user?.email}</span>
            </div>
            <div className="info-item">
              <label>Staff Type:</label>
              <span>{user?.role}</span>
            </div>
            <div className="info-item">
              <label>Staff ID:</label>
              <span>{user?.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClinicDashboard;
