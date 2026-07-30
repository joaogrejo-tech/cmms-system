import { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, CalendarClock, PlayCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { NewPreventivePlanDialog } from '@/components/preventive/new-preventive-plan-dialog';
import { usePreventivePlans, useGeneratePreventiveNow, type PreventiveFilters } from '@/hooks/use-preventive';
import { SPECIALTY_LABELS, formatDate } from '@/lib/domain';

const FREQUENCY_LABELS: Record<string, string> = { DIAS: 'dias', SEMANAS: 'semanas', MESES: 'meses', ANOS: 'anos', HORAS_USO: 'horas de uso' };

export default function PreventivePage() {
  const [filters, setFilters] = useState<PreventiveFilters>({ page: 1, perPage: 12, active: 'true' });
  const { data, isLoading } = usePreventivePlans(filters);
  const generateNow = useGeneratePreventiveNow();

  const overdueCount = data?.data.filter((p) => p.isOverdue).length ?? 0;
  const dueThisWeekCount = data?.data.filter((p) => p.isDueThisWeek && !p.isOverdue).length ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Preventivas</h1>
          <p className="text-sm text-muted-foreground">Planos de manutenção preventiva e geração automática de OS.</p>
        </div>
        <NewPreventivePlanDialog />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total de planos</p><p className="font-data text-2xl font-semibold">{data?.meta.total ?? 0}</p></CardContent></Card>
        <Card className="border-destructive/30"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Atrasadas</p><p className="font-data text-2xl font-semibold text-destructive">{overdueCount}</p></CardContent></Card>
        <Card className="border-warning/30"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Vencem esta semana</p><p className="font-data text-2xl font-semibold text-warning-foreground">{dueThisWeekCount}</p></CardContent></Card>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : data && data.data.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.data.map((plan) => (
            <Card key={plan.id} className={plan.isOverdue ? 'border-destructive/40' : plan.isDueThisWeek ? 'border-warning/40' : undefined}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <CalendarClock className="h-4.5 w-4.5 text-primary" />
                  </div>
                  {plan.isOverdue && <Badge variant="destructive"><AlertTriangle className="h-3 w-3" /> Atrasada</Badge>}
                  {!plan.isOverdue && plan.isDueThisWeek && <Badge variant="warning">Esta semana</Badge>}
                </div>

                <div>
                  <p className="font-medium">{plan.name}</p>
                  <p className="text-xs text-muted-foreground">{plan.asset.name} ({plan.asset.tag}) · {plan.asset.sector.name}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{SPECIALTY_LABELS[plan.specialty]}</span>
                  <span>A cada {plan.frequencyValue} {FREQUENCY_LABELS[plan.frequencyUnit]}</span>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Próximo vencimento</p>
                    <p className="text-sm font-medium">{formatDate(plan.nextDueAt)}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    loading={generateNow.isPending}
                    onClick={() =>
                      generateNow.mutate(plan.id, {
                        onSuccess: () => toast.success('OS gerada a partir do plano preventivo!'),
                        onError: () => toast.error('Não foi possível gerar a OS.'),
                      })
                    }
                  >
                    <PlayCircle className="h-3.5 w-3.5" /> Gerar OS agora
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card><p className="py-16 text-center text-sm text-muted-foreground">Nenhum plano preventivo cadastrado.</p></Card>
      )}

      {data && (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          total={data.meta.total}
          perPage={data.meta.perPage}
          onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
        />
      )}
    </div>
  );
}
