import { z } from 'zod';
import { AssetCriticality, AssetStatus } from '@prisma/client';

export const createAssetSchema = z.object({
  code: z.string().min(1),
  tag: z.string().min(1),
  name: z.string().min(2),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  serialNumber: z.string().optional(),
  manufactureYear: z.number().int().optional(),
  costCenter: z.string().optional(),
  sectorId: z.string().uuid(),
  criticality: z.nativeEnum(AssetCriticality).default(AssetCriticality.MEDIA),
  location: z.string().optional(),
  parentAssetId: z.string().uuid().optional(),
  manualUrl: z.string().url().optional(),
  imageUrl: z.string().optional(),
  status: z.nativeEnum(AssetStatus).default(AssetStatus.OPERACIONAL),
  acquisitionValue: z.number().nonnegative().optional(),
  installDate: z.coerce.date().optional(),
});

export const updateAssetSchema = createAssetSchema.partial();

export const listAssetsQuerySchema = z.object({
  page: z.string().optional(),
  perPage: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  sectorId: z.string().uuid().optional(),
  criticality: z.nativeEnum(AssetCriticality).optional(),
  status: z.nativeEnum(AssetStatus).optional(),
  search: z.string().optional(),
});

export const addMeterReadingSchema = z.object({
  value: z.number().nonnegative(),
  unit: z.string().default('horas'),
});

export type CreateAssetDTO = z.infer<typeof createAssetSchema>;
export type UpdateAssetDTO = z.infer<typeof updateAssetSchema>;
export type ListAssetsQueryDTO = z.infer<typeof listAssetsQuerySchema>;
