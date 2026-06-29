import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

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

export { registerUser, loginUser, logoutUser, getMe };