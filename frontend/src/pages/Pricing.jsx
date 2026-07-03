import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder, verifyPayment } from '../api/payment.js';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';

const Pricing = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpgrade = async () => {
    setError('');
    setLoading(true);

    try {
      // Step 1: Ask our backend to create a Razorpay order
      const { data: order } = await createOrder();

      // Step 2: Configure and open the Razorpay checkout popup.
      // This is Razorpay's own JS object (window.Razorpay), loaded via
      // the <script> tag we added to index.html.
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Smart Job Tracker',
        description: 'Premium Plan — Unlimited AI features',
        order_id: order.orderId,

        // This callback fires AFTER the user successfully completes
        // payment in the popup. Razorpay gives us back payment details
        // that we send to our backend for verification.
        handler: async (response) => {
          try {
            const { data } = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Update local user state to reflect premium status immediately
            setUser((prev) => ({ ...prev, isPremium: true }));
            navigate('/dashboard');
          } catch (err) {
            setError('Payment verification failed. Please contact support.');
          }
        },

        prefill: {
          name: user?.name,
          email: user?.email,
        },

        theme: {
          color: '#0f6e56', // matches our teal brand color
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      setError('Could not start payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900">Choose your plan</h2>
        <p className="mt-2 text-slate-600">Upgrade for unlimited AI-powered job search tools.</p>
      </div>

      {error && (
        <p className="mx-auto mt-6 max-w-md rounded-lg bg-rose-50 p-3 text-center text-sm text-rose-700">
          {error}
        </p>
      )}

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {/* Free plan */}
        <div className="rounded-2xl border border-slate-200 p-8">
          <h3 className="font-semibold text-slate-900">Free</h3>
          <p className="mt-2 text-3xl font-bold text-slate-900">₹0</p>
          <ul className="mt-6 space-y-3 text-sm text-slate-600">
            <li>✓ Unlimited application tracking</li>
            <li>✓ Real-time status updates</li>
            <li>✓ Interview reminders</li>
            <li>✓ 5 AI analyses per day</li>
          </ul>
          {!user?.isPremium && (
            <p className="mt-6 rounded-lg bg-slate-50 px-4 py-2 text-center text-sm font-medium text-slate-500">
              Your current plan
            </p>
          )}
        </div>

        {/* Premium plan */}
        <div className="rounded-2xl border-2 border-teal-700 p-8">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Premium</h3>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
              Best value
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            ₹99<span className="text-base font-normal text-slate-500">/month</span>
          </p>
          <ul className="mt-6 space-y-3 text-sm text-slate-600">
            <li>✓ Everything in Free</li>
            <li>✓ <strong>Unlimited</strong> AI resume scoring</li>
            <li>✓ <strong>Unlimited</strong> ATS checks</li>
            <li>✓ <strong>Unlimited</strong> follow-up email generation</li>
            <li>✓ Priority support</li>
          </ul>

          {user?.isPremium ? (
            <p className="mt-6 rounded-lg bg-emerald-50 px-4 py-2 text-center text-sm font-medium text-emerald-700">
              ✓ You're a Premium member
            </p>
          ) : (
            <Button
              variant="primary"
              className="mt-6 w-full"
              onClick={handleUpgrade}
              disabled={loading}
            >
              {loading ? 'Opening checkout...' : 'Upgrade to Premium'}
            </Button>
          )}
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        This is a test integration. Use Razorpay test card 4111 1111 1111 1111, any future expiry, any CVV.
      </p>
    </div>
  );
};

export default Pricing;