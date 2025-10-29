import express from 'express';
import {
  createSuggestion,
  getUserSuggestions,
  getSuggestion,
  deleteSuggestion,
  getAllSuggestions,
  updateSuggestionStatus,
  upload
} from '../controllers/suggestionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.route('/')
  .post(protect, upload.single('attachment'), createSuggestion)
  .get(protect, getUserSuggestions);

router.route('/:id')
  .get(protect, getSuggestion)
  .delete(protect, deleteSuggestion);

// Admin routes (for future use)
router.get('/admin/all', protect, getAllSuggestions);
router.put('/:id/status', protect, updateSuggestionStatus);

export default router;

