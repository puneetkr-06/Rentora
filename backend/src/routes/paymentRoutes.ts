import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { processDummyPayment, getLedger } from '../controllers/paymentController';
import { getOwnerPayments, getTenantPayments, getTenantMetrics, getOwnerMetrics } from '../controllers/paymentController';


// Add these below your existing routes:
const router = Router();
router.post('/dummy-pay', requireAuth, processDummyPayment);
router.get('/ledger/:leaseId', requireAuth, getLedger);
router.get('/owner-history', requireAuth, getOwnerPayments);
router.get('/tenant-history', requireAuth, getTenantPayments);
router.get('/metrics/tenant', requireAuth, getTenantMetrics);
router.get('/metrics/owner', requireAuth, getOwnerMetrics);

export default router;