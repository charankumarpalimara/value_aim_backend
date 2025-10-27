import express from 'express';
import {
  createService,
  getServices,
  getService,
  updateService,
  deleteService,
  bulkCreateServices,
  deleteAllServices
} from '../controllers/serviceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, createService)
  .get(protect, getServices);

router.post('/bulk', protect, bulkCreateServices);
router.delete('/all', protect, deleteAllServices);

router.route('/:id')
  .get(protect, getService)
  .put(protect, updateService)
  .delete(protect, deleteService);

export default router;

