import axios from 'axios';
import { io } from 'socket.io-client';

const BASE = process.env.REACT_APP_API_URL || '';

// Axios instance
const api = axios.create({ baseURL: `${BASE}/api` });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sq_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

// Socket.io singleton
let socket;
export const getSocket = () => {
  if (!socket) {
    socket = io(BASE || 'http://localhost:5000', { autoConnect: true });
  }
  return socket;
};
