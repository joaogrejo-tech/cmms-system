import { z } from 'zod';
import { FrequencyUnit, Specialty } from '@prisma/client';

export const createPreventivePlanSchema = z.object({
  name: z.string().min(3),
  assetId: z.string().uuid(),
  specialty: z.nativeEnum(Specialty),
  frequencyValue: z.number().int().positive(),
  frequencyUnit: z.nativeEnum(FrequencyUnit),
  estimatedHours: z.number().positive().optional(),
  checklistTemplate: z.array(z.string()).optional(),
  instructions: z.string().optional(),
  nextDueAt: z.coerce.date(),
});

export const updatePreventivePlanSchema = createPreventivePlanSchema.partial();

export const listPreventivePlansQuerySchema = z.object({
  page: z.string().optional(),
  perPage: z.string().optional(),
  assetId: z.string().uuid().optional(),
  specialty: z.nativeEnum(Specialty).optional(),
  active: z.enum(['true', 'false']).optional(),
});

export type CreatePreventivePlanDTO = z.infer<typeof createPreventivePlanSchema>;
export type UpdatePreventivePlanDTO = z.infer<typeof updatePreventivePlanSchema>;
export type ListPreventivePlansQueryDTO = z.infer<typeof listPreventivePlansQuerySchema>;
