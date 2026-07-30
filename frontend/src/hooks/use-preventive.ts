import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { PaginatedResponse, Specialty } from '@/types';

export interface PreventivePlanSummary {
  id: string;
  name: string;
  specialty: Specialty;
  frequencyValue: number;
  frequencyUnit: string;
  nextDueAt: string;
  lastGeneratedAt: string | null;
  isOverdue: boolean;
  isDueThisWeek: boolean;
  asset: { id: string; name: string; tag: string; sector: { id: string; name: string } };
}

export interface PreventiveFilters {
  page?: number;
  perPage?: number;
  assetId?: string;
  specialty?: Specialty;
  active?: 'true' | 'false';
}

export function usePreventivePlans(filters: PreventiveFilters) {
  return useQuery({
    queryKey: ['preventive-plans', filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<PreventivePlanSummary>>('/preventive-plans', { params: filters });
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export interface CreatePreventivePlanPayload {
  name: string;
  assetId: string;
  specialty: Specialty;
  frequencyValue: number;
  frequencyUnit: 'DIAS' | 'SEMANAS' | 'MESES' | 'ANOS' | 'HORAS_USO';
  estimatedHours?: number;
  instructions?: string;
  nextDueAt: string;
}

export function useCreatePreventivePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePreventivePlanPayload) => {
      const { data } = await api.post('/preventive-plans', payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['preventive-plans'] }),
  });
}

export function useGeneratePreventiveNow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/preventive-plans/${id}/generate-now`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preventive-plans'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
  });
}
