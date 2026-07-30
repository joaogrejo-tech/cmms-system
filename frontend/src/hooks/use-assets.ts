import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { AssetCriticality, AssetStatus, PaginatedResponse } from '@/types';

export interface AssetSummary {
  id: string;
  code: string;
  tag: string;
  name: string;
  manufacturer?: string | null;
  criticality: AssetCriticality;
  status: AssetStatus;
  sector: { id: string; name: string };
  _count?: { workOrders: number };
}

export interface AssetFilters {
  page?: number;
  perPage?: number;
  sectorId?: string;
  criticality?: AssetCriticality;
  status?: AssetStatus;
  search?: string;
}

export function useAssets(filters: AssetFilters) {
  return useQuery({
    queryKey: ['assets', filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<AssetSummary>>('/assets', { params: filters });
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useAsset(id: string | undefined) {
  return useQuery({
    queryKey: ['assets', id],
    queryFn: async () => {
      const { data } = await api.get(`/assets/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export interface CreateAssetPayload {
  code: string;
  tag: string;
  name: string;
  model?: string;
  manufacturer?: string;
  serialNumber?: string;
  manufactureYear?: number;
  sectorId: string;
  criticality: AssetCriticality;
  location?: string;
  status: AssetStatus;
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateAssetPayload) => {
      const { data } = await api.post('/assets', payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assets'] }),
  });
}

export function useAddMeterReading() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, value, unit }: { id: string; value: number; unit: string }) => {
      const { data } = await api.post(`/assets/${id}/meter-readings`, { value, unit });
      return data;
    },
    onSuccess: (_data, variables) => queryClient.invalidateQueries({ queryKey: ['assets', variables.id] }),
  });
}
