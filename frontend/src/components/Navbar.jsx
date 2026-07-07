import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link to="/" className="text-lg font-bold tracking-tight text-slate-900" onClick={closeMenu}>
          Smart<span className="text-teal-700">Tracker</span>
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Dashboard
              </Link>
              <Link to="/resume-ai" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                AI Analyzer
              </Link>
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                Hi, {user.name.split(' ')[0]}
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
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Login
              </Link>
              <Link to="/register">
                <Button variant="primary">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Hamburger button — visible only on mobile */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-6 bg-slate-700 transition-transform duration-200 ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`block h-0.5 w-6 bg-slate-700 transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-6 bg-slate-700 transition-transform duration-200 ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-6 py-4 flex flex-col gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-700">
                  Hi, {user.name.split(' ')[0]}
                </span>
                {user.isPremium && (
                  <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
                    Premium
                  </span>
                )}
              </div>
              <Link
                to="/dashboard"
                onClick={closeMenu}
                className="text-sm font-medium text-slate-700 hover:text-teal-700"
              >
                📋 Dashboard
              </Link>
              <Link
                to="/resume-ai"
                onClick={closeMenu}
                className="text-sm font-medium text-slate-700 hover:text-teal-700"
              >
                🤖 AI Analyzer
              </Link>
              <button
                onClick={handleLogout}
                className="text-left text-sm font-medium text-rose-600 hover:text-rose-700"
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={closeMenu}
                className="text-sm font-medium text-slate-700 hover:text-teal-700"
              >
                Login
              </Link>
              <Link to="/register" onClick={closeMenu}>
                <Button variant="primary" className="w-full">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;