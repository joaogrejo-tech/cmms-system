import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '@/middlewares/authenticate';

const router = Router();
const controller = new AuthController();

router.post('/login', (req, res) => controller.login(req, res));
router.post('/refresh', (req, res) => controller.refresh(req, res));
router.post('/logout', (req, res) => controller.logout(req, res));
router.get('/me', authenticate, (req, res) => controller.me(req, res));
router.get('/permissions', authenticate, (req, res) => controller.permissions(req, res));

export { router as authRoutes };
