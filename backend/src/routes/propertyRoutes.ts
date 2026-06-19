import { Router } from 'express';
import { createProperty, getProperties, deleteProperty, getPropertyStats } from '../controllers/propertyController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/stats', requireAuth, getPropertyStats);
router.post('/', requireAuth, createProperty);
router.get('/', requireAuth, getProperties);
router.delete('/:propertyId', requireAuth, deleteProperty); 

export default router;