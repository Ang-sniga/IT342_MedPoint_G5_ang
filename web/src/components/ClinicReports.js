import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../services/appointmentAPI';
import './Dashboard.css';
import TopBar from './TopBar';

function ClinicReports() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    try {
      const res = await appointmentAPI.getPendingAppointments();
      setPending(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => { await appointmentAPI.approveAppointment(id); fetchPending(); };
  const handleReject = async (id) => { await appointmentAPI.rejectAppointment(id); fetchPending(); };

  if (loading) return <div>Loading reports...</div>;

  return (
    <div>
      <TopBar />
      <div className="dashboard-container clinic-panel">
        <div className="dashboard-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h2>Reports — Pending Appointments</h2>
          <div>
            <button className="back-button" onClick={() => navigate('/clinic-dashboard')}>← Back</button>
          </div>
        </div>
      <div className="record-list">
        {pending.map(a => (
          <div key={a.id} className="record-item">
            <h4>Patient ID: {a.userId} — {a.doctor}</h4>
            <div><strong>Date/Time:</strong> {a.date} {a.time}</div>
            <div className="notes"><strong>Notes:</strong> {a.notes || '—'}</div>
            <div className="action-row">
              <button className="btn-primary" onClick={() => handleApprove(a.id)}>Approve</button>
              <button className="btn-ghost" onClick={() => handleReject(a.id)}>Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
}

export default ClinicReports;
