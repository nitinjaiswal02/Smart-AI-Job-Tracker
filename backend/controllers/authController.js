import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

import sendEmail from '../utils/sendEmail.js'; // for reset password flow
import crypto from 'crypto';   //.   for reset password flow

// Note: these are plain async functions with no try/catch around the
// "throw new Error(...)" calls. Express 5 automatically catches rejected
// promises from async route handlers and forwards them to our errorHandler
// middleware — same as calling next(error) ourselves.

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    const error = new Error('Please provide name, email, and password');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('An account with this email already exists');
    error.statusCode = 409; // 409 Conflict — the resource already exists
    throw error;
  }

  // .create() runs our pre-save hook, so `password` is hashed automatically.
  const user = await User.create({ name, email, password });

  const token = generateToken(res, user._id);

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isPremium: user.isPremium,
    token,
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error('Please provide email and password');
    error.statusCode = 400;
    throw error;
  }

  // .select('+password') overrides the schema's `select: false` JUST for
  // this query, since we actually need the hash to compare against.
  const user = await User.findOne({ email }).select('+password');

  // Deliberately vague error message — "wrong password" vs "no such user"
  // tells an attacker which emails are registered. Always say the same
  // generic thing for both cases.
  if (!user || !(await user.comparePassword(password))) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(res, user._id);

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isPremium: user.isPremium,
    token,
  });
};

const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

const getMe = (req, res) => {
  // req.user was attached by the `protect` middleware before this ever runs.
  res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    isPremium: req.user.isPremium,
    token: req.cookies.jwt || null, // return the JWT from the cookie if it exists
  });
};



// --- Password Reset Flow ---

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    const error = new Error('Please provide your email address');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email });

  // Deliberately same response whether email exists or not —
  // prevents "user enumeration attack" (attacker finding which
  // emails are registered by checking error messages)
  if (!user) {
    return res.status(200).json({
      message: 'If an account exists with this email, a reset link has been sent.',
    });
  }

  // Generate a random 32-byte token — this becomes part of the reset URL.
  // crypto.randomBytes is cryptographically secure (unlike Math.random()).
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Store a HASHED version of the token in the database — never store
  // raw tokens, same reason we don't store plain passwords.
  // If the database leaks, raw tokens would let attackers reset any account.
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Token expires in 15 minutes — short window reduces attack surface
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

  await user.save({ validateBeforeSave: false });
  // validateBeforeSave: false — skip schema validation for this save
  // (we're only updating reset fields, not touching required fields like password)

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request — Smart Job Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #0f6e56;">Reset Your Password</h2>
          <p>Hi ${user.name},</p>
          <p>You requested a password reset. Click the button below to set a new password:</p>
          <a href="${resetUrl}"
             style="display: inline-block; background: #0f6e56; color: white;
                    padding: 12px 24px; border-radius: 8px; text-decoration: none;
                    font-weight: bold; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #64748b; font-size: 13px;">
            This link expires in <strong>15 minutes</strong>.<br/>
            If you didn't request this, ignore this email — your password won't change.
          </p>
        </div>
      `,
    });

    res.status(200).json({
      message: 'If an account exists with this email, a reset link has been sent.',
    });
  } catch (err) {
    // If email fails, clear the token — user can try again
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    const error = new Error('Email could not be sent. Please try again.');
    error.statusCode = 500;
    throw error;
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    const error = new Error('Password must be at least 6 characters');
    error.statusCode = 400;
    throw error;
  }

  // Hash the token from the URL to compare with the stored hash
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user with matching token that hasn't expired yet
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }, // $gt = greater than — token still valid
  });

  if (!user) {
    const error = new Error('Reset link is invalid or has expired');
    error.statusCode = 400;
    throw error;
  }

  // Set new password — pre-save hook will hash it automatically
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  // Auto-login after reset — generate new token
  const jwtToken = generateToken(res, user._id);

  res.status(200).json({
    message: 'Password reset successful',
    token: jwtToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isPremium: user.isPremium,
    },
  });
};

export { registerUser, loginUser, logoutUser, getMe, forgotPassword, resetPassword };