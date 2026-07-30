import { Router } from 'express';
import { PurchaseController } from './purchase.controller';
import { authenticate } from '@/middlewares/authenticate';
import { authorize } from '@/middlewares/authorize';

const router = Router();
const controller = new PurchaseController();

router.use(authenticate, authorize('ADMIN', 'PCM'));

router.get('/', (req, res) => controller.list(req, res));
router.get('/:id', (req, res) => controller.findById(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.patch('/:id/status', (req, res) => controller.changeStatus(req, res));

export { router as purchaseRoutes };
