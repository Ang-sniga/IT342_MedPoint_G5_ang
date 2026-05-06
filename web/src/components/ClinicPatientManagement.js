import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../services/appointmentAPI';
import './Dashboard.css';
import TopBar from './TopBar';

function ClinicPatientManagement() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchApproved(); }, []);

  const fetchApproved = async () => {
    try {
      const res = await appointmentAPI.getAllApprovedAppointments();
      setAppointments(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <div>Loading approved appointments...</div>;

  return (
    <div>
      <TopBar />
      <div className="dashboard-container clinic-panel">
        <div className="dashboard-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h2>Patient Management — Approved Appointments</h2>
          <div>
            <button className="back-button" onClick={() => navigate('/clinic-dashboard')}>← Back</button>
          </div>
        </div>
      <div className="record-list">
        {appointments.map(a => (
          <div key={a.id} className="record-item">
            <h4>Patient ID: {a.userId} — {a.doctor}</h4>
            <div><strong>Date/Time:</strong> {a.date} {a.time}</div>
            <div className="notes"><strong>Notes:</strong> {a.notes || '—'}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
}

export default ClinicPatientManagement;
