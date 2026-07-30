import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '@/shared/errors/AppError';

/**
 * Restringe o acesso da rota aos papéis informados.
 * Uso: router.get('/', authenticate, authorize('ADMIN', 'PCM'), controller.list)
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Perfil "${req.user.role}" não tem acesso a este recurso.`,
      );
    }

    return next();
  };
}

/**
 * Matriz de referência de permissões por módulo, usada pelo frontend
 * (endpoint /me/permissions) para ocultar itens de menu e ações.
 */
export const PERMISSION_MATRIX: Record<string, Role[]> = {
  dashboard: ['ADMIN', 'PCM', 'SUPERVISOR', 'MECANICO', 'ELETRICISTA', 'SOLICITANTE'],
  workOrders_viewAll: ['ADMIN', 'PCM', 'SUPERVISOR'],
  workOrders_viewOwn: ['MECANICO', 'ELETRICISTA', 'SOLICITANTE'],
  workOrders_create: ['ADMIN', 'PCM', 'SUPERVISOR', 'SOLICITANTE'],
  workOrders_assign: ['ADMIN', 'PCM', 'SUPERVISOR'],
  workOrders_execute: ['MECANICO', 'ELETRICISTA'],
  assets_manage: ['ADMIN', 'PCM'],
  preventive_manage: ['ADMIN', 'PCM'],
  purchases_manage: ['ADMIN', 'PCM'],
  inventory_manage: ['ADMIN', 'PCM'],
  suppliers_manage: ['ADMIN', 'PCM'],
  employees_manage: ['ADMIN'],
  reports_view: ['ADMIN', 'PCM', 'SUPERVISOR'],
  settings_manage: ['ADMIN'],
};
