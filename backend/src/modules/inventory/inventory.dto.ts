import { z } from 'zod';

export const createPartSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(2),
  description: z.string().optional(),
  unit: z.string().default('UN'),
  quantity: z.number().nonnegative().default(0),
  minStock: z.number().nonnegative().default(0),
  location: z.string().optional(),
  unitCost: z.number().nonnegative().default(0),
  supplierId: z.string().uuid().optional(),
});

export const updatePartSchema = createPartSchema.partial();

export const listPartsQuerySchema = z.object({
  page: z.string().optional(),
  perPage: z.string().optional(),
  search: z.string().optional(),
  belowMinimum: z.enum(['true', 'false']).optional(),
  supplierId: z.string().uuid().optional(),
});

export const stockMovementSchema = z.object({
  type: z.enum(['ENTRADA', 'SAIDA', 'AJUSTE', 'DEVOLUCAO']),
  quantity: z.number().positive(),
  reason: z.string().optional(),
});

export type CreatePartDTO = z.infer<typeof createPartSchema>;
export type UpdatePartDTO = z.infer<typeof updatePartSchema>;
export type ListPartsQueryDTO = z.infer<typeof listPartsQuerySchema>;
export type StockMovementDTO = z.infer<typeof stockMovementSchema>;
