import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function TopBar() {
  const navigate = useNavigate();

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <h1 className="navbar-brand">Medpoint</h1>
        <div className="navbar-user">
          <span className="user-greeting">{user ? `Welcome, ${user.name}!` : ''}</span>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}

export default TopBar;
