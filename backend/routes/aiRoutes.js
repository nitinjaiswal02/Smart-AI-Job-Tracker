import express from 'express';
import { scoreResume, atsCheck, generateFollowUp } from '../controllers/aiController.js';
import protect from '../middleware/authMiddleware.js';
import checkAILimit from '../middleware/aiLimitMiddleware.js';

const router = express.Router();

router.use(protect);

// checkAILimit runs between protect and the controller — order matters:
// 1. protect verifies WHO the user is
// 2. checkAILimit checks if THIS user can make another AI call
// 3. controller actually does the work
router.post('/score-resume', checkAILimit, scoreResume);
router.post('/ats-check', checkAILimit, atsCheck);
router.post('/generate-followup', checkAILimit, generateFollowUp);

export default router;