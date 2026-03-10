import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const authAPI = {
  register: (name, email, password, role) => {
    return api.post('/auth/register', {
      name,
      email,
      password,
      role
    });
  },

  login: (email, password) => {
    return api.post('/auth/login', {
      email,
      password
    });
  }
};

export default api;
