import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { PaginatedResponse } from '@/types';

export interface PartRow {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  unit: string;
  quantity: number;
  minStock: number;
  location?: string | null;
  unitCost: number;
  belowMinimum: boolean;
  supplier?: { id: string; name: string } | null;
}

export interface PartFilters {
  page?: number;
  perPage?: number;
  search?: string;
  belowMinimum?: 'true' | 'false';
}

export function useParts(filters: PartFilters) {
  return useQuery({
    queryKey: ['parts', filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<PartRow>>('/parts', { params: filters });
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export interface CreatePartPayload {
  code: string;
  name: string;
  description?: string;
  unit: string;
  quantity: number;
  minStock: number;
  unitCost: number;
  location?: string;
  supplierId?: string;
}

export function useCreatePart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePartPayload) => {
      const { data } = await api.post('/parts', payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parts'] }),
  });
}

export function useRegisterStockMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      type,
      quantity,
      reason,
    }: {
      id: string;
      type: 'ENTRADA' | 'SAIDA' | 'AJUSTE' | 'DEVOLUCAO';
      quantity: number;
      reason?: string;
    }) => {
      const { data } = await api.post(`/parts/${id}/movements`, { type, quantity, reason });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parts'] }),
  });
}
