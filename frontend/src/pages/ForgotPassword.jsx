import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true); // show success state regardless of whether email exists
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-2xl">
            📧
          </div>
          <h2 className="text-xl font-bold text-slate-900">Check your email</h2>
          <p className="mt-2 text-sm text-slate-600">
            If an account exists for <strong>{email}</strong>, a password reset
            link has been sent. Check your spam folder too.
          </p>
          <p className="mt-2 text-xs text-slate-400">Link expires in 15 minutes.</p>
          <Link
            to="/login"
            className="mt-6 inline-block text-sm font-medium text-teal-700 hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Forgot your password?</h2>
        <p className="mt-1 text-sm text-slate-600">
          Enter your email and we'll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && (
            <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
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

export default ForgotPassword;