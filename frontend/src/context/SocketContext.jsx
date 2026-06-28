// SocketContext.jsx for React frontend. This context manages the Socket.io connection and provides a way for components to subscribe to real-time events.

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null); // useRef so we hold the socket instance
  // without triggering re-renders when it changes
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Only connect if user is logged in AND we have their token
    if (!user) {
      // If user logs out, disconnect any existing socket
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    // Get the JWT token from the user object (set during login/register
    // in AuthContext — we also stored it in the user response)
    const token = user.token;

    if (!token) return;

    // Connect to the backend Socket.io server.
    // The `auth` object is sent as part of the handshake — our backend
    // socket middleware reads socket.handshake.auth.token to verify identity.
    const socket = io(
      import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001',
      {
        auth: { token },
        withCredentials: true,
        // transports: ['websocket'] — force WebSocket only (skip long-polling)
        // We leave this out so Socket.io can fall back to polling if
        // the environment blocks WebSockets (some corporate proxies do).
      }
    );

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    // Cleanup: disconnect when user logs out or component unmounts
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [user]); // re-run when user changes (login/logout)

  // Expose the socket instance and a helper to subscribe to events
  const subscribe = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const unsubscribe = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  return (
    <SocketContext.Provider value={{ connected, subscribe, unsubscribe }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);