import { Link, useNavigate } from "react-router-dom";
import Button from "./Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="text-lg font-bold tracking-tight text-slate-900"
        >
          Smart<span className="text-teal-700">Tracker</span>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Dashboard
              </Link>
              <Link
                to="/resume-ai"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                AI Analyzer
              </Link>
              {/* <Link
                to="/pricing"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Pricing
              </Link> */}
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                Hi, {user.name.split(" ")[0]}
                {user.isPremium && (
                  <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
                    Premium
                  </span>
                )}
              </span>
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Login
              </Link>
              <Link to="/register">
                <Button variant="primary">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
