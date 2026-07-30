import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authenticate } from '@/middlewares/authenticate';

const router = Router();
const controller = new NotificationController();

router.use(authenticate);

router.get('/', (req, res) => controller.list(req, res));
router.patch('/:id/read', (req, res) => controller.markAsRead(req, res));
router.patch('/read-all', (req, res) => controller.markAllAsRead(req, res));

export { router as notificationRoutes };
