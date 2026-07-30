import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import type { User } from '@/types';

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await api.post<LoginResponse>('/auth/login', payload);
      return data;
    },
    onSuccess: (data) => {
      setSession(data);
    },
  });
}

export function useLogout() {
  const { refreshToken, clearSession } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken }).catch(() => undefined);
      }
    },
    onSuccess: () => {
      clearSession();
      queryClient.clear();
    },
  });
}

export function usePermissions() {
  const setPermissions = useAuthStore((s) => s.setPermissions);
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['auth', 'permissions'],
    queryFn: async () => {
      const { data } = await api.get<{ role: string; permissions: Record<string, boolean> }>('/auth/permissions');
      setPermissions(data.permissions);
      return data;
    },
    enabled: Boolean(accessToken),
    staleTime: 1000 * 60 * 30,
  });
}
