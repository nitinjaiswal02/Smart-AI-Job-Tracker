import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // While we're still checking if a session exists (the brief moment
  // before useEffect's API call resolves), show a loading state instead
  // of immediately redirecting — otherwise a logged-in user would flash
  // to /login for a split second on every page refresh.
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-500">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;