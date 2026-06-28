import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // BrowserRouter enables client-side routing in the React app, allowing navigation between different pages without full page reloads.
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx'; // AuthProvider wraps the app and provides authentication state and functions to all components via React Context, enabling features like login, logout, and user info access.
import { SocketProvider } from './context/SocketContext.jsx'; // SocketProvider wraps the app and provides a Socket.io connection and subscription management to all components via React Context, enabling real-time updates for application changes and comments.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);