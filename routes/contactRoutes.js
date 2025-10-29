import express from 'express';
import {
  createContact,
  getAllContacts,
  getContact,
  updateContactStatus,
  deleteContact
} from '../controllers/contactController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public route - anyone can contact
router.route('/')
  .post(createContact)
  .get(protect, getAllContacts); // Admin only to view all contacts

// Admin routes
router.route('/:id')
  .get(protect, getContact)
  .delete(protect, deleteContact);

router.put('/:id/status', protect, updateContactStatus);

export default router;

