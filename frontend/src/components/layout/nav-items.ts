import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  ClipboardList,
  Cog,
  CalendarClock,
  ShoppingCart,
  Package,
  Truck,
  Users,
  BarChart3,
  FileText,
  Settings,
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  permissionKey?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, permissionKey: 'dashboard' },
  { label: 'Ordens de Serviço', path: '/work-orders', icon: ClipboardList },
  { label: 'Ativos', path: '/assets', icon: Cog },
  { label: 'Preventivas', path: '/preventive', icon: CalendarClock, permissionKey: 'preventive_manage' },
  { label: 'Compras', path: '/purchases', icon: ShoppingCart, permissionKey: 'purchases_manage' },
  { label: 'Estoque', path: '/inventory', icon: Package, permissionKey: 'inventory_manage' },
  { label: 'Fornecedores', path: '/suppliers', icon: Truck, permissionKey: 'suppliers_manage' },
  { label: 'Funcionários', path: '/employees', icon: Users, permissionKey: 'employees_manage' },
  { label: 'Indicadores', path: '/indicators', icon: BarChart3, permissionKey: 'reports_view' },
  { label: 'Relatórios', path: '/reports', icon: FileText, permissionKey: 'reports_view' },
  { label: 'Configurações', path: '/settings', icon: Settings, permissionKey: 'settings_manage' },
];
