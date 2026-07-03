import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import NotificationToast from "./components/NotificationToast.jsx"; // NotificationToast listens for real-time interview reminders via Socket.io and displays them as self-dismissing toast notifications.
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ResumeAI from "./pages/ResumeAI.jsx";
import Pricing from "./pages/Pricing.jsx";

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <NotificationToast />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pricing"
          element={
            <ProtectedRoute>
              <Pricing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume-ai"
          element={
            <ProtectedRoute>
              <ResumeAI />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
