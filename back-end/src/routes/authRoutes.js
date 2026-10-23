import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/login', authLimiter, authController.login);
router.post('/register', authLimiter, authController.register);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
