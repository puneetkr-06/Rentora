import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { createNotice, getTenantNotices } from '../controllers/noticeController';

const router = Router();

// Owner route
router.post('/create', requireAuth, createNotice);

// Tenant route
router.get('/me', requireAuth, getTenantNotices);

export default router;