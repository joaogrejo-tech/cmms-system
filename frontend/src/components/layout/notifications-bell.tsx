import { Bell, CheckCheck } from 'lucide-react';
import { formatDateTime } from '@/lib/domain';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
} from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';

const TYPE_LABELS: Record<string, string> = {
  OS_ATRASADA: 'OS atrasada',
  PREVENTIVA_VENCIDA: 'Preventiva vencida',
  COMPRA_PENDENTE: 'Compra pendente',
  ESTOQUE_BAIXO: 'Estoque baixo',
  MATERIAL_RECEBIDO: 'Material recebido',
  OS_ATRIBUIDA: 'Nova OS atribuída',
  COMENTARIO_OS: 'Novo comentário',
};

export function NotificationsBell() {
  const { data } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-destructive ring-2 ring-surface" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notificações</p>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead.mutate()}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Marcar todas como lidas
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {!data || data.data.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhuma notificação por aqui.</p>
          ) : (
            data.data.map((notification) => (
              <button
                key={notification.id}
                onClick={() => !notification.read && markAsRead.mutate(notification.id)}
                className={cn(
                  'flex w-full flex-col gap-1 border-b border-border px-4 py-3 text-left transition-colors last:border-0 hover:bg-surface-hover',
                  !notification.read && 'bg-primary/5',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={notification.read ? 'muted' : 'info'} className="text-[10px]">
                    {TYPE_LABELS[notification.type] ?? notification.type}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">{formatDateTime(notification.createdAt)}</span>
                </div>
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
