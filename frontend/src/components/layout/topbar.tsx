import { useNavigate } from 'react-router-dom';
import { LogOut, Search, Settings, User as UserIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationsBell } from './notifications-bell';
import { ThemeToggle } from './theme-toggle';
import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/hooks/use-auth';
import { ROLE_LABELS } from '@/lib/domain';
import { getInitials } from '@/lib/domain';

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-5">
      <div className="w-full max-w-md">
        <Input
          placeholder="Buscar OS, ativo, peça..."
          icon={<Search className="h-4 w-4" />}
          className="bg-background"
        />
      </div>

      <div className="flex items-center gap-1">
        <NotificationsBell />
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="ml-1 flex items-center gap-2 rounded-md py-1 pl-2 pr-1 outline-none transition-colors hover:bg-surface-hover">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user ? ROLE_LABELS[user.role] : ''}</p>
            </div>
            <Avatar>
              <AvatarImage src={user?.avatarUrl ?? undefined} />
              <AvatarFallback>{user ? getInitials(user.name) : '?'}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <UserIcon className="h-4 w-4" /> Meu perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="h-4 w-4" /> Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout.mutate(undefined, { onSuccess: () => navigate('/login', { replace: true }) })}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="h-4 w-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
