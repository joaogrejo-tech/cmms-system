import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { STATUS_BADGE_VARIANT, STATUS_LABELS, formatDateTime, getInitials } from '@/lib/domain';
import type { DashboardSummary } from '@/types';

interface ActivityTimelineProps {
  items: DashboardSummary['timeline'];
}

export function ActivityTimeline({ items }: ActivityTimelineProps) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma atividade recente.</p>;
  }

  return (
    <div className="space-y-0">
      {items.map((item, index) => (
        <div key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
          {index < items.length - 1 && <span className="absolute left-4 top-9 h-full w-px bg-border" />}
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-[10px]">{item.user ? getInitials(item.user.name) : '—'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1 pt-0.5">
            <p className="text-sm">
              <span className="font-medium">{item.user?.name ?? 'Sistema'}</span>{' '}
              <span className="text-muted-foreground">alterou</span>{' '}
              <span className="font-data font-medium text-primary">{item.workOrder.code}</span>
              {item.toStatus && (
                <>
                  {' '}
                  <span className="text-muted-foreground">para</span>{' '}
                  <Badge variant={STATUS_BADGE_VARIANT[item.toStatus]} className="ml-0.5">
                    {STATUS_LABELS[item.toStatus]}
                  </Badge>
                </>
              )}
            </p>
            <p className="line-clamp-1 text-xs text-muted-foreground">{item.workOrder.description}</p>
            <p className="text-[11px] text-muted-foreground">{formatDateTime(item.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
