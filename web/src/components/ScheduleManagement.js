import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../services/appointmentAPI';
import './Dashboard.css';
import TopBar from './TopBar';

function ScheduleManagement() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ doctorName: '', specialization: '', dutyDay: 'MONDAY', dutyTime: '09:00' });
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchSchedules(); }, []);

  const fetchSchedules = async () => {
    try {
      const res = await appointmentAPI.getAllSchedules();
      setSchedules(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await appointmentAPI.addDoctorSchedule(form);
      setForm({ doctorName: '', specialization: '', dutyDay: 'MONDAY', dutyTime: '09:00' });
      fetchSchedules();
    } catch (err) { alert('Failed to add schedule'); }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ doctorName: item.doctorName, specialization: item.specialization, dutyDay: item.dutyDay, dutyTime: item.dutyTime.slice(0,5) });
  };

  const cancelEdit = () => { setEditingId(null); setForm({ doctorName: '', specialization: '', dutyDay: 'MONDAY', dutyTime: '09:00' }); };

  const saveEdit = async () => {
    try {
      await appointmentAPI.updateSchedule(editingId, form);
      cancelEdit();
      fetchSchedules();
    } catch (err) { alert('Failed to update schedule'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete schedule?')) return;
    try { await appointmentAPI.deleteSchedule(id); fetchSchedules(); } catch (err) { alert('Failed to delete'); }
  };

  if (loading) return <div>Loading schedules...</div>;

  return (
    <div>
      <TopBar />
      <div className="dashboard-container clinic-panel">
        <div className="dashboard-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h2>Schedule Management</h2>
          <div>
            <button className="back-button" onClick={() => navigate('/clinic-dashboard')}>← Back</button>
          </div>
        </div>
      <div className="schedules-container">
        <div className="schedule-list">
          <h3>Existing Schedules</h3>
          {schedules.length === 0 && <div className="empty-appointments">No schedules found</div>}
          <div>
            {schedules.map(s => (
              <div key={s.id} className="schedule-item">
                <div>
                  <div className="meta">{s.doctorName} — {s.specialization}</div>
                  <div className="small">{s.dutyDay} • {s.dutyTime}</div>
                </div>
                <div>
                  <button className="btn-ghost" onClick={() => startEdit(s)}>Edit</button>
                  <button className="btn-ghost" onClick={() => handleDelete(s.id)} style={{ marginLeft: 8 }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-panel">
          <h3>{editingId ? 'Edit Schedule' : 'Add Schedule'}</h3>
          <form onSubmit={editingId ? (e => { e.preventDefault(); saveEdit(); }) : handleAdd}>
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
              <button type="submit" className="btn-primary">{editingId ? 'Save' : 'Add'}</button>
              {editingId && <button type="button" onClick={cancelEdit} className="btn-ghost">Cancel</button>}
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  );
}


export default ScheduleManagement;
