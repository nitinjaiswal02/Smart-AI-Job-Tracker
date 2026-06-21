import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// This middleware goes in front of any route that should only work for
// logged-in users, e.g.:
//   router.get('/me', protect, getMe);
const protect = async (req, res, next) => {
  let token;

  // Accept the token from EITHER the httpOnly cookie (browser clients)
  // OR an "Authorization: Bearer <token>" header (useful for testing with
  // curl/Postman).
  if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  } else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    const error = new Error('Not authorized, no token provided');
    error.statusCode = 401;
    return next(error);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.userId);

    if (!req.user) {
      const error = new Error('Not authorized, user no longer exists');
      error.statusCode = 401;
      return next(error);
    }

    next();
  } catch (err) {
    const error = new Error('Not authorized, token invalid or expired');
    error.statusCode = 401;
    next(error);
  }
};

export default protect;