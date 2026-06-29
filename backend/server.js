import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
import authRoutes from './routes/authRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import initCronJobs from './utils/cronJobs.js'; // Import the function that initializes cron jobs

dotenv.config();

connectDB();

const app = express();

// Create an explicit HTTP server from the Express app.
// Previously Express created this internally when we called app.listen().
// We need direct access to the httpServer object so Socket.io can attach
// to it — both Express and Socket.io share the same port this way.
const httpServer = http.createServer(app);

// Initialize Socket.io on the same HTTP server
initSocket(httpServer);
// Start all background cron jobs
initCronJobs();

// --- Middleware ---
app.use(helmet()); // it sets various HTTP headers to help protect the app from well-known web vulnerabilities by default.
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
if (process.env.NODE_ENV !== 'production') { // we use morgan only in development mode to log HTTP requests to the console for debugging purposes. In production, we might want to use a more robust logging solution or disable logging altogether for performance reasons.
  app.use(morgan('dev'));
}

// --- Routes ---

// TEMPORARY TEST ROUTE — remove before production
app.get('/api/test-cron', async (req, res) => {
  const Application = (await import('./models/Application.js')).default;
  const sendEmail = (await import('./utils/sendEmail.js')).default;
  const { getIO } = await import('./config/socket.js');

  // Test email sending
  await sendEmail({
    to: process.env.GMAIL_USER,
    subject: 'Smart Job Tracker — Cron Test',
    html: '<h2>Cron job email is working!</h2><p>If you see this, nodemailer is configured correctly.</p>',
  });

  // Test socket notification
  try {
    getIO().emit('notification:interview-reminder', {
      message: 'Test reminder: Your interview at Google is today!',
    });
  } catch(e) {}

  res.json({ message: 'Test email sent and socket notification broadcast' });
});


app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});



app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/ai', aiRoutes);

// --- Error handling ---
app.use(notFound); // 404 handler for unknown routes
app.use(errorHandler); // centralized error handler for all routes and middleware

const PORT = process.env.PORT || 5001;

// httpServer.listen instead of app.listen — same result but now
// Socket.io is also listening on this port alongside Express
httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});