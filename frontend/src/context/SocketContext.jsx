import {
  createContext, useContext, useEffect, useRef, useCallback
} from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  // Store all listeners here so we can attach them when socket connects
  const listenersRef = useRef({});

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const token = user.token || localStorage.getItem('token');
    if (!token) return;

    const socket = io(
      import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001',
      { auth: { token }, withCredentials: true }
    );

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      // Re-attach all registered listeners on connect/reconnect
      Object.entries(listenersRef.current).forEach(([event, callbacks]) => {
        callbacks.forEach((cb) => socket.on(event, cb));
      });
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Error:', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  // Subscribe — stable reference, never changes
  const subscribe = useCallback((event, callback) => {
    // Store in ref so we can re-attach after reconnect
    if (!listenersRef.current[event]) {
      listenersRef.current[event] = [];
    }
    listenersRef.current[event].push(callback);

    // If socket already connected, attach immediately
    if (socketRef.current?.connected) {
      socketRef.current.on(event, callback);
    }
  }, []); // ← empty array — reference NEVER changes

  // Unsubscribe — stable reference, never changes
  const unsubscribe = useCallback((event, callback) => {
    if (listenersRef.current[event]) {
      listenersRef.current[event] = listenersRef.current[event]
        .filter((cb) => cb !== callback);
    }
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []); // ← empty array — reference NEVER changes

  return (
    <SocketContext.Provider value={{ subscribe, unsubscribe }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);