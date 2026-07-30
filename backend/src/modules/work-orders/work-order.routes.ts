import { Router } from 'express';
import { WorkOrderController } from './work-order.controller';
import { authenticate } from '@/middlewares/authenticate';
import { upload } from '@/middlewares/upload';

const router = Router();
const controller = new WorkOrderController();

router.use(authenticate);

router.get('/', (req, res) => controller.list(req, res));
router.get('/:id', (req, res) => controller.findById(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.patch('/:id/status', (req, res) => controller.changeStatus(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

router.post('/:id/comments', (req, res) => controller.addComment(req, res));
router.post('/:id/checklist', (req, res) => controller.addChecklistItem(req, res));
router.patch('/checklist/:itemId', (req, res) => controller.toggleChecklistItem(req, res));
router.post('/:id/parts', (req, res) => controller.addPart(req, res));
router.post('/:id/labor', (req, res) => controller.addLaborEntry(req, res));
router.post('/:id/attachments', upload.single('file'), (req, res) => controller.uploadAttachment(req, res));

export { router as workOrderRoutes };
