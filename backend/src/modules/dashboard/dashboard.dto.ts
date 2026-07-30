import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  sectorId: z.string().uuid().optional(),
});

export type DashboardQueryDTO = z.infer<typeof dashboardQuerySchema>;
