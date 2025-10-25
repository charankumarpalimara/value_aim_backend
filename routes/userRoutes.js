import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  updateUserPlan,
  upload
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Middleware to log requests
const logRequest = (req, res, next) => {
  console.log('=== ROUTE REQUEST RECEIVED ===');
  console.log('Route:', req.path);
  console.log('Method:', req.method);
  console.log('Headers:', {
    'content-type': req.get('content-type'),
    'authorization': req.get('authorization') ? 'Present' : 'Missing'
  });
  next();
};

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, logRequest, upload.single('profileImage'), updateUserProfile);

router.put('/password', protect, changePassword);
router.put('/plan', protect, updateUserPlan);

export default router;

