import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../services/appointmentAPI';
import './Dashboard.css';

function ClinicStaffPanel() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ doctorName: '', specialization: '', dutyDay: 'MONDAY', dutyTime: '09:00' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await appointmentAPI.getPendingAppointments();
      setPending(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await appointmentAPI.approveAppointment(id);
      fetchPending();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await appointmentAPI.rejectAppointment(id);
      fetchPending();
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      await appointmentAPI.addDoctorSchedule(form);
      alert('Doctor schedule added');
    } catch (err) {
      alert('Failed to add schedule');
    }
  };

  if (loading) return <div>Loading clinic data...</div>;

  return (
    <div className="clinic-panel" style={{ marginTop: 20 }} id="clinic-pending-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Pending Appointments</h3>
      </div>

      {pending.length === 0 && <div className="empty-appointments">No pending appointments</div>}
      <div className="record-list">
        {pending.map((a) => (
          <div key={a.id} className="record-item">
            <div>
              <div className="meta"><strong>Patient ID:</strong> {a.userId} — {a.doctor}</div>
              <div className="small">{a.date} {a.time}</div>
              <div className="notes"><strong>Notes:</strong> {a.notes || '—'}</div>
            </div>
            <div className="action-row">
              <button className="btn-primary" onClick={() => handleApprove(a.id)}>Approve</button>
              <button className="btn-ghost" onClick={() => handleReject(a.id)}>Reject</button>
            </div>
          </div>
        ))}
      </div>

      <h3 id="clinic-schedule-form" style={{ marginTop: 18 }}>Add Doctor Schedule</h3>
      <form onSubmit={handleAddDoctor} className="form-panel" style={{ maxWidth: 480 }}>
        <input name="doctorName" placeholder="Doctor name" value={form.doctorName} onChange={handleChange} required />
        <input name="specialization" placeholder="Specialization" value={form.specialization} onChange={handleChange} required />
        <select name="dutyDay" value={form.dutyDay} onChange={handleChange}>
          <option>MONDAY</option>
          <option>TUESDAY</option>
          <option>WEDNESDAY</option>
          <option>THURSDAY</option>
          <option>FRIDAY</option>
          <option>SATURDAY</option>
          <option>SUNDAY</option>
        </select>
        <input name="dutyTime" placeholder="HH:MM" value={form.dutyTime} onChange={handleChange} required />
        <div className="form-actions">
          <button type="submit" className="btn-primary">Add Schedule</button>
        </div>
      </form>
    </div>
  );
}

export default ClinicStaffPanel;
