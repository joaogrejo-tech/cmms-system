import { z } from 'zod';
import { PurchaseStatus } from '@prisma/client';

export const purchaseItemSchema = z.object({
  partId: z.string().uuid().optional(),
  description: z.string().min(2),
  quantity: z.number().positive(),
  unitValue: z.number().nonnegative(),
});

export const createPurchaseOrderSchema = z.object({
  supplierId: z.string().uuid().optional(),
  quotationDeadline: z.coerce.date().optional(),
  expectedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, 'Inclua ao menos um item.'),
});

export const updatePurchaseStatusSchema = z.object({
  status: z.nativeEnum(PurchaseStatus),
});

export const updatePurchaseOrderSchema = z.object({
  supplierId: z.string().uuid().optional(),
  quotationDeadline: z.coerce.date().optional(),
  expectedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const listPurchaseOrdersQuerySchema = z.object({
  page: z.string().optional(),
  perPage: z.string().optional(),
  status: z.nativeEnum(PurchaseStatus).optional(),
  supplierId: z.string().uuid().optional(),
});

export type CreatePurchaseOrderDTO = z.infer<typeof createPurchaseOrderSchema>;
export type UpdatePurchaseOrderDTO = z.infer<typeof updatePurchaseOrderSchema>;
export type ListPurchaseOrdersQueryDTO = z.infer<typeof listPurchaseOrdersQuerySchema>;
