import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticate } from '@/middlewares/authenticate';
import { authorize } from '@/middlewares/authorize';

const router = Router();
const controller = new UserController();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'PCM', 'SUPERVISOR'), (req, res) => controller.list(req, res));
router.get('/:id', authorize('ADMIN', 'PCM', 'SUPERVISOR'), (req, res) => controller.findById(req, res));
router.post('/', authorize('ADMIN'), (req, res) => controller.create(req, res));
router.put('/:id', authorize('ADMIN'), (req, res) => controller.update(req, res));
router.patch('/:id/password', (req, res) => controller.changePassword(req, res));
router.delete('/:id', authorize('ADMIN'), (req, res) => controller.delete(req, res));

export { router as userRoutes };
