import { Router } from 'express';
import { createCluster, deleteCluster } from '../controllers/clusterController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();
router.post('/', requireAuth, createCluster);
router.delete('/:clusterId', requireAuth, deleteCluster);

export default router;