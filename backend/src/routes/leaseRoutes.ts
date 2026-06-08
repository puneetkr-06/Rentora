import { Router } from 'express';
import { createLease, joinLease, getMyLeases, assignExistingTenant} from '../controllers/leaseController';
import { requireAuth } from '../middleware/authMiddleware';


const router = Router();

router.post('/', requireAuth, createLease);
router.post('/join', requireAuth, joinLease);
router.get('/tenant', requireAuth, getMyLeases); // Pluralized
router.post('/assign', requireAuth, assignExistingTenant); // New direct assignment route

export default router;