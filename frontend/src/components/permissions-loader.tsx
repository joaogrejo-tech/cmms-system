import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { usePermissions } from '@/hooks/use-auth';

/**
 * Garante que a matriz de permissões (RBAC) esteja sempre carregada enquanto
 * houver uma sessão ativa — usada pela Sidebar para filtrar o menu por perfil.
 */
export function PermissionsLoader() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { refetch } = usePermissions();

  useEffect(() => {
    if (accessToken) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  return null;
}
