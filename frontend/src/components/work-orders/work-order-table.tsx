import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  PRIORITY_BADGE_VARIANT,
  PRIORITY_LABELS,
  SPECIALTY_LABELS,
  STATUS_BADGE_VARIANT,
  STATUS_LABELS,
  formatCurrency,
  getInitials,
} from '@/lib/domain';
import { cn } from '@/lib/utils';
import type { WorkOrderSummary } from '@/types';

interface WorkOrderTableProps {
  data: WorkOrderSummary[];
  isLoading: boolean;
}

const COLUMNS = ['Código', 'Descrição', 'Setor', 'Especialidade', 'Prioridade', 'Responsável', 'Status', 'Dias', 'SLA', 'Custo'];

export function WorkOrderTable({ data, isLoading }: WorkOrderTableProps) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
            {COLUMNS.map((col) => (
              <th key={col} className="whitespace-nowrap px-4 py-3 font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {isLoading &&
            Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>
                <td colSpan={COLUMNS.length} className="px-4 py-3">
                  <Skeleton className="h-6 w-full" />
                </td>
              </tr>
            ))}

          {!isLoading && data.length === 0 && (
            <tr>
              <td colSpan={COLUMNS.length} className="px-4 py-16 text-center text-muted-foreground">
                Nenhuma ordem de serviço encontrada com os filtros atuais.
              </td>
            </tr>
          )}

          {!isLoading &&
            data.map((wo) => (
              <tr
                key={wo.id}
                onClick={() => navigate(`/work-orders/${wo.id}`)}
                className="cursor-pointer transition-colors hover:bg-surface-hover"
              >
                <td className="whitespace-nowrap px-4 py-3 font-data text-xs font-medium text-primary">{wo.code}</td>
                <td className="max-w-[280px] px-4 py-3">
                  <p className="line-clamp-1">{wo.description}</p>
                  {wo.asset && <p className="text-xs text-muted-foreground">{wo.asset.tag}</p>}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{wo.sector.name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{SPECIALTY_LABELS[wo.specialty]}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Badge variant={PRIORITY_BADGE_VARIANT[wo.priority]}>{PRIORITY_LABELS[wo.priority]}</Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {wo.assignedTo ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[9px]">{getInitials(wo.assignedTo.name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{wo.assignedTo.name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Não atribuído</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Badge variant={STATUS_BADGE_VARIANT[wo.status]}>{STATUS_LABELS[wo.status]}</Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className={cn(wo.isLate && 'font-medium text-destructive')}>{wo.daysOpen}d</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {wo.isLate ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                      <AlertTriangle className="h-3.5 w-3.5" /> Atrasada
                    </span>
                  ) : (
                    <span className="text-xs text-success">No prazo</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-data">{formatCurrency(wo.totalCost)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
