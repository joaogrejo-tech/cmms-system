import { Router } from 'express';
import { SupplierController } from './supplier.controller';
import { authenticate } from '@/middlewares/authenticate';
import { authorize } from '@/middlewares/authorize';

const router = Router();
const controller = new SupplierController();

router.use(authenticate, authorize('ADMIN', 'PCM'));

router.get('/', (req, res) => controller.list(req, res));
router.get('/:id', (req, res) => controller.findById(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export { router as supplierRoutes };
