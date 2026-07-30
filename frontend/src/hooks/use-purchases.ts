import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { PaginatedResponse, PurchaseStatus } from '@/types';

export interface PurchaseOrderItem {
  id: string;
  description: string;
  quantity: number;
  unitValue: number;
  partId?: string | null;
}

export interface PurchaseOrderSummary {
  id: string;
  code: string;
  status: PurchaseStatus;
  totalValue: number;
  requestedAt: string;
  expectedAt?: string | null;
  supplier?: { id: string; name: string } | null;
  items: PurchaseOrderItem[];
}

export function usePurchaseOrders(filters: { status?: PurchaseStatus; page?: number; perPage?: number } = {}) {
  return useQuery({
    queryKey: ['purchase-orders', filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<PurchaseOrderSummary>>('/purchase-orders', {
        params: { ...filters, perPage: filters.perPage ?? 100 },
      });
      return data;
    },
  });
}

export interface CreatePurchaseOrderPayload {
  supplierId?: string;
  notes?: string;
  expectedAt?: string;
  items: Array<{ description: string; quantity: number; unitValue: number; partId?: string }>;
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePurchaseOrderPayload) => {
      const { data } = await api.post('/purchase-orders', payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchase-orders'] }),
  });
}

export function useChangePurchaseOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PurchaseStatus }) => {
      const { data } = await api.patch(`/purchase-orders/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['parts'] });
    },
  });
}
