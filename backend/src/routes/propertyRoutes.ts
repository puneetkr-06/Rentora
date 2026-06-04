import { Router } from 'express';
import { createProperty, getProperties, deleteProperty } from '../controllers/propertyController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/', requireAuth, createProperty);
router.get('/', requireAuth, getProperties);
router.delete('/:propertyId', requireAuth, deleteProperty); 

export default router;