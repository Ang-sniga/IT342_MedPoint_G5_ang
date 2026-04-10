import api from './authAPI';

export const appointmentAPI = {
  createAppointment: (payload) => api.post('/appointments', payload),

  getUserAppointments: (userId) => api.get(`/appointments/user/${userId}`),

  getDoctorSchedules: () => api.get('/appointments/doctors/schedules'),

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
