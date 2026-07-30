import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Sector } from '@/types';

export function useSectors() {
  return useQuery({
    queryKey: ['sectors'],
    queryFn: async () => {
      const { data } = await api.get<Sector[]>('/sectors');
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

interface SimpleUser {
  id: string;
  name: string;
  role: string;
  specialty?: string | null;
}

export function useUsers(params: { role?: string; specialty?: string } = {}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const { data } = await api.get<{ data: SimpleUser[] }>('/users', { params: { ...params, perPage: 100, active: 'true' } });
      return data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

interface SimplePart {
  id: string;
  code: string;
  name: string;
  quantity: number;
  unit: string;
}

export function usePartsLookup(search?: string) {
  return useQuery({
    queryKey: ['parts', 'lookup', search],
    queryFn: async () => {
      const { data } = await api.get<{ data: SimplePart[] }>('/parts', { params: { search, perPage: 50 } });
      return data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
  interface SimpleAsset {
  id: string;
  name: string;
  tag: string;
  sectorId: string;
}


export function useAssetsLookup(sectorId?: string) {
  return useQuery({
    queryKey: ['assets', 'lookup', sectorId],
    queryFn: async () => {
      const { data } = await api.get<{ data: SimpleAsset[] }>('/assets', { params: { sectorId, perPage: 100 } });
      return data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
