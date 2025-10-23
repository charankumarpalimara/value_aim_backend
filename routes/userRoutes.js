import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  updateUserPlan
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.put('/password', protect, changePassword);
router.put('/plan', protect, updateUserPlan);

export default router;

