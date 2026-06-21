import express from 'express';
import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  addComment,
} from '../controllers/applicationController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Every route below requires a logged-in user. Rather than writing
// `protect` in front of each individual route, router.use() applies it to
// EVERY route defined after this line, for this router only.
router.use(protect);

router.route('/')
  .post(createApplication)
  .get(getApplications);

router.route('/:id')
  .get(getApplicationById)
  .put(updateApplication)
  .delete(deleteApplication);

router.post('/:id/comments', addComment);

export default router;