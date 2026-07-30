import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { PaginatedResponse, Role, Specialty } from '@/types';

export interface EmployeeRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  specialty?: Specialty | null;
  phone?: string | null;
  registration?: string | null;
  active: boolean;
  sector?: { id: string; name: string } | null;
  lastLoginAt?: string | null;
}

export interface EmployeeFilters {
  page?: number;
  perPage?: number;
  role?: Role;
  search?: string;
  active?: 'true' | 'false';
}

export function useEmployees(filters: EmployeeFilters) {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<EmployeeRow>>('/users', { params: filters });
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export interface CreateEmployeePayload {
  name: string;
  email: string;
  password: string;
  role: Role;
  specialty?: Specialty;
  sectorId?: string;
  phone?: string;
  registration?: string;
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateEmployeePayload) => {
      const { data } = await api.post('/users', payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useDeactivateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });
}
