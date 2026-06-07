import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { 
  createComplaint, 
  getTenantComplaints, 
  getOwnerComplaints, 
  updateComplaintStatus 
} from '../controllers/complaintController';

const router = Router();

router.post('/', requireAuth, createComplaint);
router.get('/tenant', requireAuth, getTenantComplaints);
router.get('/owner', requireAuth, getOwnerComplaints);
router.put('/:id/status', requireAuth, updateComplaintStatus);

export default router;