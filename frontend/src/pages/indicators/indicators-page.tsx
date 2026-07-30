import { useDashboardSummary, useCostByAsset } from '@/hooks/use-dashboard';
import { StatCard } from '@/components/dashboard/stat-card';
import { ChartCard } from '@/components/dashboard/chart-card';
import { BarChart } from '@/components/dashboard/bar-chart';
import { PieChart } from '@/components/dashboard/pie-chart';
import { RadialGauge } from '@/components/ui/radial-gauge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Gauge, Timer, Wallet, Layers, TrendingUp, CheckCircle2 } from 'lucide-react';
import { SPECIALTY_LABELS, MAINTENANCE_TYPE_LABELS, formatCurrency } from '@/lib/domain';

export default function IndicatorsPage() {
  const { data, isLoading } = useDashboardSummary();
  const { data: costByAsset, isLoading: isLoadingCostByAsset } = useCostByAsset();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  const { cards, charts, indicators } = data;
  const averageCostPerWorkOrder = cards.totalWorkOrders > 0 ? cards.costThisYear / cards.totalWorkOrders : 0;
  const efficiencyPercent = cards.totalWorkOrders > 0 ? (cards.completedWorkOrders / cards.totalWorkOrders) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Indicadores</h1>
        <p className="text-sm text-muted-foreground">Métricas de performance da manutenção (PCM).</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Backlog" value={cards.backlog} icon={Layers} />
        <StatCard label="Lead Time médio" value={`${cards.averageResolutionTimeHours}h`} icon={Timer} />
        <StatCard label="Custo médio por OS" value={formatCurrency(averageCostPerWorkOrder)} icon={Wallet} />
        <StatCard label="Eficiência" value={`${efficiencyPercent.toFixed(1)}%`} icon={TrendingUp} tone="success" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-semibold text-foreground">Indicadores-chave (KPIs)</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap justify-around gap-6 pt-0">
          <RadialGauge value={indicators.slaCompliancePercent} label="Cumprimento de SLA" colorClassName="stroke-success" />
          <RadialGauge value={indicators.availabilityPercent} label="Disponibilidade" colorClassName="stroke-primary" />
          <RadialGauge value={Math.min(100, (indicators.mttrHours / 24) * 100)} label="MTTR" sublabel={`${indicators.mttrHours}h`} colorClassName="stroke-warning" />
          <RadialGauge value={Math.min(100, (indicators.mtbfHours / 720) * 100)} label="MTBF" sublabel={`${indicators.mtbfHours}h`} colorClassName="stroke-info" />
          <RadialGauge value={efficiencyPercent} label="Eficiência" colorClassName="stroke-success" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Custo por Máquina (Top 15)">
          {isLoadingCostByAsset ? <Skeleton className="h-64" /> : <BarChart data={costByAsset ?? []} horizontal valueFormatter={(v) => formatCurrency(v)} colorIndex={5} height={340} />}
        </ChartCard>
        <ChartCard title="Custo por Setor">
          <BarChart data={charts.costBySector} horizontal valueFormatter={(v) => formatCurrency(v)} colorIndex={3} height={340} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="OS por Responsável">
          <BarChart data={charts.byResponsible} horizontal colorIndex={4} />
        </ChartCard>
        <ChartCard title="OS por Especialidade">
          <PieChart data={charts.bySpecialty} labelMap={SPECIALTY_LABELS} donut />
        </ChartCard>
        <ChartCard title="Corretiva x Preventiva x Melhoria">
          <PieChart data={charts.correctivePreventiveDonut} labelMap={MAINTENANCE_TYPE_LABELS} donut />
        </ChartCard>
      </div>
    </div>
  );
}
