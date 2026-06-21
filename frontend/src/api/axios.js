import axios from 'axios';

// A pre-configured instance of axios. withCredentials: true is required for
// the browser to attach our httpOnly JWT cookie to cross-origin requests
// (frontend on 5173, backend on 5001 are technically different "origins").
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  withCredentials: true,
});

export default api;