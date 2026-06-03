// src/routes/auth.ts
import { Router } from 'express';
import { authController } from '@controllers/auth/AuthController';
import { requireAuth } from '@middleware/auth';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', requireAuth, authController.me); // protected

export default router;
