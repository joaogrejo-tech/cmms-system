import { Badge } from '@/components/ui/badge';
import { STATUS_BADGE_VARIANT, STATUS_LABELS, formatDateTime } from '@/lib/domain';
import type { WorkOrderStatus } from '@/types';

interface HistoryPanelProps {
  history: Array<{
    id: string;
    fromStatus: WorkOrderStatus | null;
    toStatus: WorkOrderStatus | null;
    note: string | null;
    createdAt: string;
    user: { id: string; name: string } | null;
  }>;
}

export function HistoryPanel({ history }: HistoryPanelProps) {
  if (history.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum histórico registrado.</p>;
  }

  return (
    <div className="space-y-0">
      {history.map((h, index) => (
        <div key={h.id} className="relative flex gap-3 pb-5 last:pb-0">
          {index < history.length - 1 && <span className="absolute left-[7px] top-4 h-full w-px bg-border" />}
          <span className="mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-primary bg-surface" />
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5 text-sm">
              {h.fromStatus && (
                <>
                  <Badge variant={STATUS_BADGE_VARIANT[h.fromStatus]}>{STATUS_LABELS[h.fromStatus]}</Badge>
                  <span className="text-muted-foreground">→</span>
                </>
              )}
              {h.toStatus && <Badge variant={STATUS_BADGE_VARIANT[h.toStatus]}>{STATUS_LABELS[h.toStatus]}</Badge>}
            </div>
            {h.note && <p className="text-sm text-muted-foreground">{h.note}</p>}
            <p className="text-[11px] text-muted-foreground">
              {h.user?.name ?? 'Sistema'} · {formatDateTime(h.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
