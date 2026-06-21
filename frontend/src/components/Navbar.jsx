import { Link } from 'react-router-dom';
import Button from './Button.jsx';

const Navbar = () => {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-lg font-bold tracking-tight text-slate-900">
          Smart<span className="text-teal-700">Tracker</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Dashboard
          </Link>
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Login
          </Link>
          <Link to="/register">
            <Button variant="primary">Get Started</Button>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;