import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { getProfile, updateProfile } from '../controllers/userController';

const router = Router();

// Fetching the profile uses GET
router.get('/profile', requireAuth, getProfile);

// Updating the profile MUST use PUT
router.put('/profile', requireAuth, updateProfile);

export default router;