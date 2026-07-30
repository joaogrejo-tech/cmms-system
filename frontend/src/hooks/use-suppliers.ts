import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { PaginatedResponse } from '@/types';

export interface SupplierRow {
  id: string;
  name: string;
  cnpj?: string | null;
  contact?: string | null;
  phone?: string | null;
  email?: string | null;
  rating?: number | null;
}

export function useSuppliers(filters: { search?: string; page?: number; perPage?: number } = {}) {
  return useQuery({
    queryKey: ['suppliers', filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<SupplierRow>>('/suppliers', {
        params: { ...filters, perPage: filters.perPage ?? 100 },
      });
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export interface CreateSupplierPayload {
  name: string;
  cnpj?: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateSupplierPayload) => {
      const { data } = await api.post('/suppliers', payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  });
}
