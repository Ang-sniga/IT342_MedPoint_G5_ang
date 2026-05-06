import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roleNavigationStrategy } from '../services/roleNavigationStrategy';
import { appointmentAPI } from '../services/appointmentAPI';
import './Dashboard.css';

const DAY_NAMES = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAY_LABELS = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun'
};

const getTodayISODate = () => new Date().toISOString().split('T')[0];

const getDayNameFromDate = (dateValue) => {
  if (!dateValue) {
    return null;
  }

  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return DAY_NAMES[date.getDay()];
};

const normalizeTime = (timeValue) => {
  if (!timeValue) {
    return '';
  }

  return String(timeValue).slice(0, 5);
};

function PatientDashboard() {
  const navigate = useNavigate();
  const appointmentAreaRef = useRef(null);
  const todayISODate = getTodayISODate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [doctorSchedules, setDoctorSchedules] = useState([]);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [submittingAppointment, setSubmittingAppointment] = useState(false);
  const [reschedulingAppointmentId, setReschedulingAppointmentId] = useState(null);
  const [savingReschedule, setSavingReschedule] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    doctor: '',
    date: '',
    time: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });
  const [bookingForm, setBookingForm] = useState({
    doctor: '',
    date: '',
    time: '',
    notes: ''
  });

  const getDoctorSchedule = (doctorName) => doctorSchedules.find((item) => item.doctor === doctorName);

  const getDoctorDutyLabel = (doctorName) => {
    const schedule = getDoctorSchedule(doctorName);
    if (!schedule) {
      return 'No schedule available';
    }

    const days = schedule.dutyDays.map((day) => DAY_LABELS[day] || day).join(', ');
    return `${schedule.specialization} | Duty: ${days}`;
  };

  const getAvailableTimeSlots = (doctorName) => {
    const schedule = getDoctorSchedule(doctorName);
    return schedule ? schedule.timeSlots : [];
  };

  const isDoctorOnDuty = (doctorName, dateValue) => {
    if (!doctorName || !dateValue) {
      return true;
    }

    const schedule = getDoctorSchedule(doctorName);
    if (!schedule) {
      return false;
    }

    const dayName = getDayNameFromDate(dateValue);
    if (!dayName) {
      return false;
    }

    return schedule.dutyDays.includes(dayName);
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      const userString = localStorage.getItem('user');
      const userRole = localStorage.getItem('userRole');

      if (!userString || !roleNavigationStrategy.canAccessDashboard(userRole, roleNavigationStrategy.roleIds.patient)) {
        navigate('/login');
        return;
      }

      const userData = JSON.parse(userString);
      setUser(userData);
      setProfileForm({
        name: userData.name || '',
        email: userData.email || ''
      });

      try {
        const [appointmentsResponse, schedulesResponse] = await Promise.all([
          appointmentAPI.getUserApprovedAppointments(userData.id),
          appointmentAPI.getDoctorSchedules()
        ]);

        const schedules = schedulesResponse.data || [];
        // Only show approved (confirmed) appointments
        setAppointments(appointmentsResponse.data || []);
        setDoctorSchedules(schedules);
        setBookingForm((prev) => ({
          ...prev,
          doctor: schedules[0]?.doctor || ''
        }));
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to load appointments from server.';
        setConfirmationMessage(message);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [navigate]);

  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'doctor') {
      setBookingForm((prev) => {
        const shouldResetDate = prev.date && !isDoctorOnDuty(value, prev.date);
        return {
          ...prev,
          doctor: value,
          date: shouldResetDate ? '' : prev.date,
          time: ''
        };
      });

      if (bookingForm.date && !isDoctorOnDuty(value, bookingForm.date)) {
        setConfirmationMessage('Selected doctor is not on duty on the chosen date. Please pick another date.');
      }

      return;
    }

    if (name === 'date') {
      if (!isDoctorOnDuty(bookingForm.doctor, value)) {
        setBookingForm((prev) => ({
          ...prev,
          date: '',
          time: ''
        }));
        setConfirmationMessage('Selected doctor is not on duty on that date.');
        return;
      }

      setBookingForm((prev) => ({
        ...prev,
        date: value,
        time: ''
      }));
      return;
    }

    setBookingForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();

    if (!bookingForm.doctor || !bookingForm.date || !bookingForm.time || !user) {
      setConfirmationMessage('Please complete doctor, date, and time.');
      return;
    }

    if (!isDoctorOnDuty(bookingForm.doctor, bookingForm.date)) {
      setConfirmationMessage('Doctor is not on duty on the selected date.');
      return;
    }

    if (!getAvailableTimeSlots(bookingForm.doctor).includes(bookingForm.time)) {
      setConfirmationMessage('Please choose a valid duty time for this doctor.');
      return;
    }

    setSubmittingAppointment(true);

    try {
      const response = await appointmentAPI.createAppointment({
        userId: user.id,
        doctor: bookingForm.doctor,
        date: bookingForm.date,
        time: bookingForm.time,
        notes: bookingForm.notes.trim()
      });

      const savedAppointment = response.data;
      setAppointments((prev) => [savedAppointment, ...prev]);

      setBookingForm((prev) => ({
        ...prev,
        date: '',
        time: '',
        notes: ''
      }));

      setConfirmationMessage(`Appointment confirmed with ${savedAppointment.doctor} on ${savedAppointment.date} at ${savedAppointment.time}.`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save appointment.';
      setConfirmationMessage(message);
    } finally {
      setSubmittingAppointment(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!user) {
      return;
    }

    try {
      const response = await appointmentAPI.cancelAppointment(appointmentId, user.id);
      const updatedAppointment = response.data;

      setAppointments((prev) =>
        prev.map((appointment) => (appointment.id === appointmentId ? updatedAppointment : appointment))
      );

      setConfirmationMessage('Appointment cancelled.');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel appointment.';
      setConfirmationMessage(message);
    }
  };

  const startReschedule = (appointment) => {
    setReschedulingAppointmentId(appointment.id);
    setRescheduleForm({
      doctor: appointment.doctor,
      date: appointment.date,
      time: normalizeTime(appointment.time)
    });
  };

  const cancelReschedule = () => {
    setReschedulingAppointmentId(null);
    setRescheduleForm({
      doctor: '',
      date: '',
      time: ''
    });
  };

  const handleRescheduleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'doctor') {
      setRescheduleForm((prev) => {
        const shouldResetDate = prev.date && !isDoctorOnDuty(value, prev.date);
        return {
          ...prev,
          doctor: value,
          date: shouldResetDate ? '' : prev.date,
          time: ''
        };
      });
      return;
    }

    if (name === 'date') {
      if (!isDoctorOnDuty(rescheduleForm.doctor, value)) {
        setConfirmationMessage('Doctor is not on duty on that reschedule date.');
        return;
      }

      setRescheduleForm((prev) => ({
        ...prev,
        date: value,
        time: ''
      }));
      return;
    }

    setRescheduleForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveReschedule = async (appointmentId) => {
    if (!user) {
      return;
    }

    if (!rescheduleForm.doctor || !rescheduleForm.date || !rescheduleForm.time) {
      setConfirmationMessage('Please complete doctor, date, and time to reschedule.');
      return;
    }

    if (!isDoctorOnDuty(rescheduleForm.doctor, rescheduleForm.date)) {
      setConfirmationMessage('Doctor is not on duty on the selected reschedule date.');
      return;
    }

    if (!getAvailableTimeSlots(rescheduleForm.doctor).includes(rescheduleForm.time)) {
      setConfirmationMessage('Please choose a valid duty time when rescheduling.');
      return;
    }

    setSavingReschedule(true);

    try {
      const response = await appointmentAPI.rescheduleAppointment(appointmentId, user.id, {
        doctor: rescheduleForm.doctor,
        date: rescheduleForm.date,
        time: rescheduleForm.time
      });

      const updatedAppointment = response.data;
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId ? updatedAppointment : appointment
        )
      );

      setReschedulingAppointmentId(null);
      setConfirmationMessage('Appointment rescheduled successfully.');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reschedule appointment.';
      setConfirmationMessage(message);
    } finally {
      setSavingReschedule(false);
    }
  };

  const handleSeeAllAppointments = () => {
    appointmentAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || ''
    });
    setIsEditingProfile(false);
  };

  const handleSaveProfile = () => {
    if (!user) {
      return;
    }

    const updatedUser = {
      ...user,
      name: profileForm.name.trim(),
      email: profileForm.email.trim()
    };

    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setIsEditingProfile(false);
    setConfirmationMessage('Profile information updated successfully.');
  };

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

      <div className="dashboard-content patient-dashboard-content">
        <div className="dashboard-header patient-dashboard-header">
          <h2>Patient Dashboard</h2>
          <p>Book and manage your clinic appointments in one place.</p>
        </div>

        {confirmationMessage && <div className="booking-alert">{confirmationMessage}</div>}

        <section className="dashboard-grid dashboard-actions">
          <div className="dashboard-card">
            <h3>All Appointments</h3>
            <p>See your complete appointment list and current booking status.</p>
            <button type="button" className="card-button" onClick={handleSeeAllAppointments}>
              See All Appointments
            </button>
          </div>
          <div className="dashboard-card">
            <h3>My Profile</h3>
            <p>Update your name and email used for clinic appointment records.</p>
            <button type="button" className="card-button" onClick={handleEditProfile}>
              Edit My Profile
            </button>
          </div>
        </section>

        <section className="booking-layout">
          <div className="booking-card booking-form-card">
            <h3>Book Appointments</h3>
            <form onSubmit={handleBookAppointment} className="booking-form">
              <label htmlFor="doctor">Doctor</label>
              <select
                id="doctor"
                name="doctor"
                value={bookingForm.doctor}
                onChange={handleBookingInputChange}
                required
              >
                {doctorSchedules.map((schedule) => (
                  <option key={schedule.doctor} value={schedule.doctor}>
                    {schedule.doctor}
                  </option>
                ))}
              </select>

              {bookingForm.doctor && (
                <p className="schedule-meta">{getDoctorDutyLabel(bookingForm.doctor)}</p>
              )}

              <label htmlFor="date">Date</label>
              <input
                id="date"
                name="date"
                type="date"
                min={todayISODate}
                value={bookingForm.date}
                onChange={handleBookingInputChange}
                required
              />

              {bookingForm.date && (
                <p className={`duty-date-hint ${isDoctorOnDuty(bookingForm.doctor, bookingForm.date) ? 'valid' : 'invalid'}`}>
                  {isDoctorOnDuty(bookingForm.doctor, bookingForm.date)
                    ? 'Doctor is on duty on this date.'
                    : 'Doctor is not on duty on this date.'}
                </p>
              )}

              <label htmlFor="time">Time Slot</label>
              <select
                id="time"
                name="time"
                value={bookingForm.time}
                onChange={handleBookingInputChange}
                required
              >
                <option value="">Select duty time</option>
                {getAvailableTimeSlots(bookingForm.doctor).map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>

              <label htmlFor="notes">Symptoms (optional)</label>
              <textarea
                id="notes"
                name="notes"
                value={bookingForm.notes}
                onChange={handleBookingInputChange}
                placeholder="Describe fever or other symptoms for your check-up"
                rows="4"
              />

              <button type="submit" className="card-button" disabled={submittingAppointment}>
                {submittingAppointment ? 'Saving...' : 'Confirm Appointment'}
              </button>
            </form>
          </div>

          <div ref={appointmentAreaRef} className="booking-card booking-list-card">
            <h3>Your Appointment Area</h3>
            {appointments.length === 0 ? (
              <p className="empty-appointments">No appointments yet.</p>
            ) : (
              <div className="appointments-list">
                {appointments.map((appointment) => (
                  <article key={appointment.id} className="appointment-item">
                    <div>
                      <h4>General Check-up Appointment</h4>
                      <p>{appointment.doctor}</p>
                      <p>
                        {appointment.date} at {appointment.time}
                      </p>
                      {appointment.notes && <p>Symptoms: {appointment.notes}</p>}
                      <span className={`appointment-status ${String(appointment.status).toLowerCase()}`}>
                        {appointment.status === 'CONFIRMED' ? 'Confirmed' : 'Cancelled'}
                      </span>
                    </div>

                    <div className="appointment-actions">
                      {String(appointment.status).toLowerCase() !== 'cancelled' && (
                        <>
                          <button
                            type="button"
                            className="reschedule-button"
                            onClick={() => startReschedule(appointment)}
                          >
                            Reschedule
                          </button>
                          <button
                            type="button"
                            className="cancel-button"
                            onClick={() => handleCancelAppointment(appointment.id)}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>

                    {reschedulingAppointmentId === appointment.id && (
                      <div className="reschedule-panel">
                        <label htmlFor={`reschedule-doctor-${appointment.id}`}>Doctor</label>
                        <select
                          id={`reschedule-doctor-${appointment.id}`}
                          name="doctor"
                          value={rescheduleForm.doctor}
                          onChange={handleRescheduleInputChange}
                        >
                          {doctorSchedules.map((schedule) => (
                            <option key={schedule.doctor} value={schedule.doctor}>
                              {schedule.doctor}
                            </option>
                          ))}
                        </select>
                        <p className="schedule-meta">{getDoctorDutyLabel(rescheduleForm.doctor)}</p>

                        <label htmlFor={`reschedule-date-${appointment.id}`}>Date</label>
                        <input
                          id={`reschedule-date-${appointment.id}`}
                          type="date"
                          name="date"
                          min={todayISODate}
                          value={rescheduleForm.date}
                          onChange={handleRescheduleInputChange}
                        />

                        <label htmlFor={`reschedule-time-${appointment.id}`}>Time Slot</label>
                        <select
                          id={`reschedule-time-${appointment.id}`}
                          name="time"
                          value={rescheduleForm.time}
                          onChange={handleRescheduleInputChange}
                        >
                          <option value="">Select duty time</option>
                          {getAvailableTimeSlots(rescheduleForm.doctor).map((slot) => (
                            <option key={slot} value={slot}>
                              {slot}
                            </option>
                          ))}
                        </select>

                        <div className="reschedule-actions">
                          <button
                            type="button"
                            className="card-button"
                            onClick={() => handleSaveReschedule(appointment.id)}
                            disabled={savingReschedule}
                          >
                            {savingReschedule ? 'Saving...' : 'Save New Schedule'}
                          </button>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={cancelReschedule}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="user-info-section">
          <h3>Account Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              {isEditingProfile ? (
                <input
                  className="profile-input"
                  type="text"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileInputChange}
                />
              ) : (
                <span>{user?.name}</span>
              )}
            </div>
            <div className="info-item">
              <label>Email:</label>
              {isEditingProfile ? (
                <input
                  className="profile-input"
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileInputChange}
                />
              ) : (
                <span>{user?.email}</span>
              )}
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
          {isEditingProfile && (
            <div className="profile-actions">
              <button type="button" className="card-button" onClick={handleSaveProfile}>
                Save Profile
              </button>
              <button type="button" className="secondary-button" onClick={handleCancelEditProfile}>
                Cancel
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default PatientDashboard;
