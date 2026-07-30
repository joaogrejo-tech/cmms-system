import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/app-layout';
import { ProtectedRoute } from './protected-route';
import LoginPage from '@/pages/auth/login-page';
import DashboardPage from '@/pages/dashboard/dashboard-page';
import WorkOrdersPage from '@/pages/work-orders/work-orders-page';
import WorkOrderDetailPage from '@/pages/work-orders/work-order-detail-page';
import AssetsPage from '@/pages/assets/assets-page';
import AssetDetailPage from '@/pages/assets/asset-detail-page';
import PreventivePage from '@/pages/preventive/preventive-page';
import PurchasesPage from '@/pages/purchases/purchases-page';
import InventoryPage from '@/pages/inventory/inventory-page';
import SuppliersPage from '@/pages/suppliers/suppliers-page';
import EmployeesPage from '@/pages/employees/employees-page';
import IndicatorsPage from '@/pages/indicators/indicators-page';
import ReportsPage from '@/pages/reports/reports-page';
import SettingsPage from '@/pages/settings/settings-page';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/work-orders', element: <WorkOrdersPage /> },
          { path: '/work-orders/:id', element: <WorkOrderDetailPage /> },
          { path: '/assets', element: <AssetsPage /> },
          { path: '/assets/:id', element: <AssetDetailPage /> },
          {
            element: <ProtectedRoute allowedRoles={['ADMIN', 'PCM']} />,
            children: [
              { path: '/preventive', element: <PreventivePage /> },
              { path: '/purchases', element: <PurchasesPage /> },
              { path: '/inventory', element: <InventoryPage /> },
              { path: '/suppliers', element: <SuppliersPage /> },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={['ADMIN']} />,
            children: [{ path: '/employees', element: <EmployeesPage /> }],
          },
          {
            element: <ProtectedRoute allowedRoles={['ADMIN', 'PCM', 'SUPERVISOR']} />,
            children: [
              { path: '/indicators', element: <IndicatorsPage /> },
              { path: '/reports', element: <ReportsPage /> },
            ],
          },
          { path: '/settings', element: <SettingsPage /> },
          { path: '*', element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);
