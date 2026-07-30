import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { authenticate } from '@/middlewares/authenticate';
import { authorize } from '@/middlewares/authorize';

const router = Router();
const controller = new InventoryController();

router.use(authenticate);

router.get('/', (req, res) => controller.list(req, res));
router.get('/:id', (req, res) => controller.findById(req, res));
router.post('/', authorize('ADMIN', 'PCM'), (req, res) => controller.create(req, res));
router.put('/:id', authorize('ADMIN', 'PCM'), (req, res) => controller.update(req, res));
router.delete('/:id', authorize('ADMIN', 'PCM'), (req, res) => controller.delete(req, res));
router.post('/:id/movements', authorize('ADMIN', 'PCM'), (req, res) => controller.registerMovement(req, res));

export { router as inventoryRoutes };
