import api from './authAPI';

export const appointmentAPI = {
  createAppointment: (payload) => api.post('/appointments', payload),

  getUserAppointments: (userId) => api.get(`/appointments/user/${userId}`),

  getUserApprovedAppointments: (userId) => api.get(`/appointments/user/${userId}/approved`),
  getDoctorSchedules: () => api.get('/appointments/doctors/schedules'),
  getPendingAppointments: () => api.get('/clinic/appointments/pending'),

  approveAppointment: (appointmentId) => api.put(`/clinic/appointments/${appointmentId}/approve`),

  rejectAppointment: (appointmentId) => api.put(`/clinic/appointments/${appointmentId}/reject`),

  addDoctorSchedule: (payload) => api.post('/clinic/doctors', payload),
  getAllSchedules: () => api.get('/clinic/schedules'),
  deleteSchedule: (id) => api.delete(`/clinic/schedules/${id}`),
  updateSchedule: (id, payload) => api.put(`/clinic/schedules/${id}`, payload),
  getAllApprovedAppointments: () => api.get('/clinic/appointments/approved'),

  cancelAppointment: (appointmentId, userId) =>
    api.put(`/appointments/${appointmentId}/cancel`, null, {
      params: { userId }
    }),

  rescheduleAppointment: (appointmentId, userId, payload) =>
    api.put(`/appointments/${appointmentId}/reschedule`, payload, {
      params: { userId }
    })
};

export default appointmentAPI;
