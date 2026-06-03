import { Router } from 'express';
import { createRoom, getRoomsByProperty } from '../controllers/roomController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Endpoint to add a new room
router.post('/', requireAuth, createRoom);

// Endpoint to get rooms for a specific property (e.g., /api/rooms/1234-uuid)
router.get('/:propertyId', requireAuth, getRoomsByProperty);

export default router;