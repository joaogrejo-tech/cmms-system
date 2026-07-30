import { Router } from 'express';
import { authRoutes } from '@/modules/auth/auth.routes';
import { workOrderRoutes } from '@/modules/work-orders/work-order.routes';
import { assetRoutes } from '@/modules/assets/asset.routes';
import { preventiveRoutes } from '@/modules/preventive/preventive.routes';
import { purchaseRoutes } from '@/modules/purchases/purchase.routes';
import { inventoryRoutes } from '@/modules/inventory/inventory.routes';
import { supplierRoutes } from '@/modules/suppliers/supplier.routes';
import { userRoutes } from '@/modules/users/user.routes';
import { dashboardRoutes } from '@/modules/dashboard/dashboard.routes';
import { notificationRoutes } from '@/modules/notifications/notification.routes';
import { sectorRoutes } from '@/modules/sectors/sector.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/work-orders', workOrderRoutes);
router.use('/assets', assetRoutes);
router.use('/preventive-plans', preventiveRoutes);
router.use('/purchase-orders', purchaseRoutes);
router.use('/parts', inventoryRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/sectors', sectorRoutes);

// Relatórios (exportação PDF/Excel/CSV) entram na próxima fase, junto com o frontend.
// router.use('/reports', reportRoutes);

export { router as apiRoutes };
