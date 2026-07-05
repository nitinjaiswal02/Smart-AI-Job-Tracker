import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';

const ResetPassword = () => {
  const { token } = useParams(); // token comes from the URL /reset-password/:token
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      // Auto-login after successful reset
      if (data.token) localStorage.setItem('token', data.token);
      setUser(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Reset link is invalid or expired. Please request a new one.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Set new password</h2>
        <p className="mt-1 text-sm text-slate-600">
          Choose a strong password for your account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="New password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Confirm new password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          {error && (
            <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset password'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-teal-700 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;