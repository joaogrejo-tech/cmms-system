import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate } from '@/middlewares/authenticate';

const router = Router();
const controller = new DashboardController();

router.use(authenticate);
router.get('/summary', (req, res) => controller.getSummary(req, res));
router.get('/cost-by-asset', (req, res) => controller.getCostByAsset(req, res));

export { router as dashboardRoutes };
