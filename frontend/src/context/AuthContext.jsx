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
    setUser(data);
  };

  const register = async (details) => {
    const { data } = await registerUser(details);
    setUser(data);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — lets any component just call useAuth() instead of
// importing useContext + AuthContext every time.
export const useAuth = () => useContext(AuthContext);