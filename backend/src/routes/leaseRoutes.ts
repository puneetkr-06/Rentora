import { Router } from 'express';
import { createLease, joinLease,getMyLease } from '../controllers/leaseController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Endpoint for an Owner to create a new lease and generate a join_id
router.post('/', requireAuth, createLease);

// Endpoint for a Tenant to claim a room using a join_id
router.post('/join', requireAuth, joinLease);
router.get('/me', requireAuth, getMyLease);

export default router;