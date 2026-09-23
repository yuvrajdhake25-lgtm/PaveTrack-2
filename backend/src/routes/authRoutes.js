import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  getDemoAccounts,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/demo-accounts', getDemoAccounts);

export default router;
