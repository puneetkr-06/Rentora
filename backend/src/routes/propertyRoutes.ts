import { Router } from 'express';
import { createProperty, getProperties } from '../controllers/propertyController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Notice how we place requireAuth BEFORE the controller function
// This ensures the user is verified before the controller ever runs.
router.post('/', requireAuth, createProperty);
router.get('/', requireAuth, getProperties);

export default router;