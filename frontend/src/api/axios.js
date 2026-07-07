import axios from 'axios';

// A pre-configured instance of axios. withCredentials: true kept for local
// dev (same-origin cookie flow still works there). For production
// (Vercel frontend + Render backend), browsers like Safari/Brave block
// cross-site cookies, so we ALSO attach the token via Authorization header
// as a reliable fallback — the backend's `protect` middleware already
// checks both.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;