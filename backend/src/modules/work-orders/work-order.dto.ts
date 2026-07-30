import { z } from 'zod';
import { MaintenanceType, Priority, Specialty, WorkOrderStatus, WorkOrderSubStatus } from '@prisma/client';

export const createWorkOrderSchema = z.object({
  description: z.string().min(5, 'Descreva o problema com mais detalhes.'),
  detailedNotes: z.string().optional(),
  specialty: z.nativeEnum(Specialty),
  sectorId: z.string().uuid('Setor inválido.'),
  maintenanceType: z.nativeEnum(MaintenanceType),
  priority: z.nativeEnum(Priority).default(Priority.MEDIA),
  assignedToId: z.string().uuid().optional(),
  assetId: z.string().uuid().optional(),
  dueAt: z.coerce.date().optional(),
});

export const updateWorkOrderSchema = createWorkOrderSchema.partial();

export const changeStatusSchema = z.object({
  status: z.nativeEnum(WorkOrderStatus),
  subStatus: z.nativeEnum(WorkOrderSubStatus).optional(),
  note: z.string().optional(),
});

export const listWorkOrdersQuerySchema = z.object({
  page: z.string().optional(),
  perPage: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  status: z.nativeEnum(WorkOrderStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  specialty: z.nativeEnum(Specialty).optional(),
  maintenanceType: z.nativeEnum(MaintenanceType).optional(),
  sectorId: z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
  requesterId: z.string().uuid().optional(),
  search: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  onlyLate: z.enum(['true', 'false']).optional(),
});

export const addCommentSchema = z.object({
  content: z.string().min(1, 'O comentário não pode ser vazio.'),
});

export const addChecklistItemSchema = z.object({
  description: z.string().min(2),
  order: z.number().int().optional(),
});

export const toggleChecklistItemSchema = z.object({
  done: z.boolean(),
});

export const addPartSchema = z.object({
  partId: z.string().uuid(),
  quantity: z.number().positive('A quantidade deve ser maior que zero.'),
});

export const addLaborEntrySchema = z.object({
  userId: z.string().uuid(),
  hours: z.number().positive('As horas devem ser maiores que zero.'),
  hourlyRate: z.number().nonnegative().optional(),
  date: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export type CreateWorkOrderDTO = z.infer<typeof createWorkOrderSchema>;
export type UpdateWorkOrderDTO = z.infer<typeof updateWorkOrderSchema>;
export type ChangeStatusDTO = z.infer<typeof changeStatusSchema>;
export type ListWorkOrdersQueryDTO = z.infer<typeof listWorkOrdersQuerySchema>;
