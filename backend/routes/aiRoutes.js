import express from 'express';
import { scoreResume, atsCheck, generateFollowUp } from '../controllers/aiController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// All AI routes require authentication — we don't want anyone calling
// our OpenAI endpoints without being logged in (each call costs money).
router.use(protect);

router.post('/score-resume', scoreResume);
router.post('/ats-check', atsCheck);
router.post('/generate-followup', generateFollowUp);

export default router;