import express from 'express';
import { 
  createOrUpdateCompany, 
  getCompany, 
  deleteCompany 
} from '../controllers/companyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, createOrUpdateCompany)
  .get(protect, getCompany)
  .delete(protect, deleteCompany);

export default router;

