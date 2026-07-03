import crypto from 'crypto';
import razorpay from '../config/razorpay.js';
import User from '../models/User.js';

const PREMIUM_PRICE_INR = 99; // ₹99 — student-friendly pricing

// @route   POST /api/payment/create-order
// Step 1 of the payment flow: ask Razorpay to create an "order" — a
// record of an intended payment. This does NOT charge anyone yet —
// it just generates an order ID that the frontend's Razorpay checkout
// popup needs to open.
const createOrder = async (req, res) => {
  try {
    const options = {
  amount: PREMIUM_PRICE_INR * 100,
  currency: "INR",
  receipt: `rcpt_${Date.now()}`, // ~18 characters
};

    console.log("Options:", options);
    console.log("KEY ID:", process.env.RAZORPAY_KEY_ID);

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay Error:", err);

    return res.status(400).json({
      message: err.message,
      error: err.error || err,
    });
  }
};
// @route   POST /api/payment/verify
// Step 2 of the payment flow — THE MOST IMPORTANT SECURITY STEP.
//
// After the user completes payment in the Razorpay popup, the frontend
// gets back a payment ID and a signature. We NEVER trust the frontend's
// claim that "payment succeeded" — anyone could fake that with a browser
// devtools call. Instead, we recompute the signature ourselves using our
// secret key, and compare it to what Razorpay sent. Only if they match
// do we know the payment is genuine and wasn't tampered with.
const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    const error = new Error('Missing payment verification details');
    error.statusCode = 400;
    throw error;
  }

  // This is the exact algorithm Razorpay specifies: HMAC-SHA256 of
  // "order_id|payment_id", signed with our secret key.
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const isSignatureValid = expectedSignature === razorpay_signature;

  if (!isSignatureValid) {
    const error = new Error('Payment verification failed — signature mismatch');
    error.statusCode = 400;
    throw error;
  }

  // Signature checks out — this payment is genuine. Upgrade the user.
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { isPremium: true },
    { new: true }
  );

  res.status(200).json({
    message: 'Payment verified successfully. Welcome to Premium!',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isPremium: user.isPremium,
    },
  });
};

export { createOrder, verifyPayment };