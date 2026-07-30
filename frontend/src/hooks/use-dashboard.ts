import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { DashboardSummary } from '@/types';

interface DashboardFilters {
  dateFrom?: string;
  dateTo?: string;
  sectorId?: string;
}

export function useCostByAsset() {
  return useQuery({
    queryKey: ['dashboard', 'cost-by-asset'],
    queryFn: async () => {
      const { data } = await api.get<{ label: string; value: number }[]>('/dashboard/cost-by-asset');
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useDashboardSummary(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard', 'summary', filters],
    queryFn: async () => {
      const { data } = await api.get<DashboardSummary>('/dashboard/summary', {
        params: filters,
      });
      return data;
    },
    staleTime: 1000 * 60,
  });
}