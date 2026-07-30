import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  permissions: Record<string, boolean>;
  setSession: (data: { user: User; accessToken: string; refreshToken: string }) => void;
  setAccessToken: (token: string) => void;
  setPermissions: (permissions: Record<string, boolean>) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      permissions: {},
      setSession: ({ user, accessToken, refreshToken }) => set({ user, accessToken, refreshToken }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setPermissions: (permissions) => set({ permissions }),
      clearSession: () => set({ user: null, accessToken: null, refreshToken: null, permissions: {} }),
    }),
    { name: 'cmms-auth' },
  ),
);
