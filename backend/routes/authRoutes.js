import express from 'express';
import { registerUser, loginUser, logoutUser, getMe } from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes — anyone can hit these
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Protected route — `protect` runs first and blocks the request if there's
// no valid token, before getMe ever executes.
router.get('/me', protect, getMe);

export default router;