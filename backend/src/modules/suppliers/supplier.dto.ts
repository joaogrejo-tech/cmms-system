import { z } from 'zod';

export const createSupplierSchema = z.object({
  name: z.string().min(2),
  cnpj: z.string().optional(),
  contact: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export const listSuppliersQuerySchema = z.object({
  page: z.string().optional(),
  perPage: z.string().optional(),
  search: z.string().optional(),
});

export type CreateSupplierDTO = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierDTO = z.infer<typeof updateSupplierSchema>;
export type ListSuppliersQueryDTO = z.infer<typeof listSuppliersQuerySchema>;
