import { Router } from 'express';
import { createRoom, getRoomsByProperty, deallocateRoom, deleteRoom } from '../controllers/roomController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/', requireAuth, createRoom);
router.get('/:propertyId', requireAuth, getRoomsByProperty);

// Add the new deallocation route
router.put('/:roomId/deallocate', requireAuth, deallocateRoom);
router.delete('/:roomId', requireAuth, deleteRoom);

export default router;