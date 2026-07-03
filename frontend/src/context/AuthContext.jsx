import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser, fetchCurrentUser } from '../api/auth.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check if a session already exists

  // On first load (or page refresh), we don't know yet if the httpOnly
  // cookie from a previous login is still valid. We ask the backend by
  // hitting /auth/me — if it succeeds, we get the user back; if it
  // fails (401), we know nobody's logged in.
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await fetchCurrentUser();
        if (data.token) localStorage.setItem('token', data.token); 
        setUser(data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []); // empty dependency array = run once, when the component first mounts

  const login = async (credentials) => {
  const { data } = await loginUser(credentials);
  if (data.token) localStorage.setItem('token', data.token);
  setUser(data);
};

const register = async (details) => {
  const { data } = await registerUser(details);
  if (data.token) localStorage.setItem('token', data.token);
  setUser(data);
};

const logout = async () => {
  await logoutUser();
  localStorage.removeItem('token');
  setUser(null);
};

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — lets any component just call useAuth() instead of
// importing useContext + AuthContext every time.
export const useAuth = () => useContext(AuthContext);