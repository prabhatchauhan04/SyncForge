import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import { Router } from 'express';

const router = Router();

router.use('/auth' , authRoutes);
router.use('/user' , userRoutes);

export default router;
