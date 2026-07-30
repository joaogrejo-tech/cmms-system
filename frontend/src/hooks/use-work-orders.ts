import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { MaintenanceType, PaginatedResponse, Priority, Specialty, WorkOrderStatus, WorkOrderSummary } from '@/types';

export interface WorkOrderFilters {
  page?: number;
  perPage?: number;
  status?: WorkOrderStatus;
  priority?: Priority;
  specialty?: Specialty;
  maintenanceType?: MaintenanceType;
  sectorId?: string;
  assignedToId?: string;
  search?: string;
  onlyLate?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useWorkOrders(filters: WorkOrderFilters) {
  return useQuery({
    queryKey: ['work-orders', filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<WorkOrderSummary>>('/work-orders', {
        params: { ...filters, onlyLate: filters.onlyLate ? 'true' : undefined },
      });
      return data;
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useWorkOrder(id: number | undefined) {
  return useQuery({
    queryKey: ['work-orders', id],
    queryFn: async () => {
      const { data } = await api.get(`/work-orders/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export interface CreateWorkOrderPayload {
  description: string;
  detailedNotes?: string;
  specialty: Specialty;
  sectorId: string;
  maintenanceType: MaintenanceType;
  priority: Priority;
  assignedToId?: string;
  assetId?: string;
  dueAt?: string;
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateWorkOrderPayload) => {
      const { data } = await api.post('/work-orders', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useChangeWorkOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, subStatus, note }: { id: number; status: WorkOrderStatus; subStatus?: string; note?: string }) => {
      const { data } = await api.patch(`/work-orders/${id}/status`, { status, subStatus, note });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useAddWorkOrderComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, content }: { id: number; content: string }) => {
      const { data } = await api.post(`/work-orders/${id}/comments`, { content });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders', variables.id] });
    },
  });
}

export function useAddChecklistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, description }: { id: number; description: string }) => {
      const { data } = await api.post(`/work-orders/${id}/checklist`, { description });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders', variables.id] });
    },
  });
}

export function useToggleChecklistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, done, workOrderId }: { itemId: string; done: boolean; workOrderId: number }) => {
      const { data } = await api.patch(`/work-orders/checklist/${itemId}`, { done });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders', variables.workOrderId] });
    },
  });
}

export function useAddWorkOrderPart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, partId, quantity }: { id: number; partId: string; quantity: number }) => {
      const { data } = await api.post(`/work-orders/${id}/parts`, { partId, quantity });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders', variables.id] });
    },
  });
}

export function useAddLaborEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId, hours, hourlyRate, notes }: { id: number; userId: string; hours: number; hourlyRate?: number; notes?: string }) => {
      const { data } = await api.post(`/work-orders/${id}/labor`, { userId, hours, hourlyRate, notes });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders', variables.id] });
    },
  });
}

export function useUploadWorkOrderAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file }: { id: number; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post(`/work-orders/${id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders', variables.id] });
    },
  });
}
