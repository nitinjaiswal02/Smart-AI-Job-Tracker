import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';


// Load variables from .env into process.env. Must happen before we read
// any of them below (e.g. process.env.PORT).
dotenv.config();

connectDB();


const app = express();


// --- Middleware (runs on EVERY request, in this order) ---

// helmet sets a bunch of security-related HTTP headers for you (things like
// disabling X-Powered-By so we don't advertise "this is an Express app" to
// attackers). One line, real protection.
app.use(helmet());

// Our React app will run on a different origin (different port during dev,
// different domain in production). `credentials: true` is required for the
// browser to actually send/receive our httpOnly JWT cookie across origins;
// `origin` must be an explicit URL (not '*') for credentialed requests to
// work at all — that's a browser rule.
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Parses the "jwt" cookie off incoming requests into req.cookies.
app.use(cookieParser());

// Without this, req.body would be undefined for any JSON the client sends.
// This parses the raw request body into a usable JavaScript object.
app.use(express.json());

// Logs every request (method, path, status, response time) to the console.
// Only in development — production servers usually ship logs elsewhere.
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// --- Routes ---

// A health-check endpoint. This isn't for users — it's for YOU (and later,
// for deployment platforms / uptime monitors) to confirm the server is alive
// without hitting any real business logic.
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Feature routes get mounted here as we build them in later phases, e.g.:
// Feature routes
app.use('/api/auth', authRoutes);
// app.use('/api/applications', applicationRoutes);

// --- Error handling (must be registered LAST) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});