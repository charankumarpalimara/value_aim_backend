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

// Handle OPTIONS preflight requests
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

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

