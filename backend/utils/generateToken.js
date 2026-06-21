import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Why a cookie instead of just handing the token back in the JSON body and
// letting React stick it in localStorage (the pattern you'll see in a LOT
// of tutorials)? Because localStorage is readable by any JavaScript running
// on the page — including a malicious script injected via an XSS bug.
// An httpOnly cookie is invisible to JavaScript entirely; only the browser
// sends it automatically with each request. That closes off an entire class
// of token-theft attacks.
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true, // not accessible via document.cookie in JS
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'strict', // cookie won't be sent on cross-site requests (CSRF defense)
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days, in milliseconds
  });

  return token;
};

export default generateToken;