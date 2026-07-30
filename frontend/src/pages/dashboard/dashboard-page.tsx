import {
  ClipboardList,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  Timer,
  Flame,
  Layers,
} from 'lucide-react';
import { useDashboardSummary } from '@/hooks/use-dashboard';
import { StatCard } from '@/components/dashboard/stat-card';
import { ChartCard } from '@/components/dashboard/chart-card';
import { PieChart } from '@/components/dashboard/pie-chart';
import { BarChart } from '@/components/dashboard/bar-chart';
import { LineChart } from '@/components/dashboard/line-chart';
import { CallsHeatmap } from '@/components/dashboard/calls-heatmap';
import { ActivityTimeline } from '@/components/dashboard/activity-timeline';
import { RadialGauge } from '@/components/ui/radial-gauge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { STATUS_LABELS, SPECIALTY_LABELS, MAINTENANCE_TYPE_LABELS, formatCurrency } from '@/lib/domain';

export default function DashboardPage() {
  const { data, isLoading } = useDashboardSummary();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  const { cards, charts, timeline, indicators } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard executivo</h1>
        <p className="text-sm text-muted-foreground">Visão geral da manutenção em tempo real.</p>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Total de OS" value={cards.totalWorkOrders} icon={ClipboardList} />
        <StatCard label="OS Pendentes" value={cards.pendingWorkOrders} icon={Clock} tone="warning" />
        <StatCard label="Em andamento" value={cards.inProgressWorkOrders} icon={Layers} />
        <StatCard label="Concluídas" value={cards.completedWorkOrders} icon={CheckCircle2} tone="success" />
        <StatCard label="Atrasadas" value={cards.lateWorkOrders} icon={AlertTriangle} tone="destructive" />
        <StatCard label="Alta prioridade" value={cards.highPriorityWorkOrders} icon={Flame} tone="warning" />
        <StatCard label="Custo do mês" value={formatCurrency(cards.costThisMonth)} icon={Wallet} />
        <StatCard label="Custo do ano" value={formatCurrency(cards.costThisYear)} icon={Wallet} />
        <StatCard label="Tempo médio" value={`${cards.averageResolutionTimeHours}h`} icon={Timer} />
        <StatCard label="Backlog" value={cards.backlog} icon={Layers} />
      </div>

      {/* Indicadores em manômetro */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-foreground">Indicadores de desempenho</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap justify-around gap-6 pt-0">
          <RadialGauge value={indicators.slaCompliancePercent} label="SLA cumprido" colorClassName="stroke-success" />
          <RadialGauge value={indicators.availabilityPercent} label="Disponibilidade" colorClassName="stroke-primary" />
          <RadialGauge
            value={Math.min(100, (indicators.mttrHours / 24) * 100)}
            label="MTTR"
            sublabel={`${indicators.mttrHours}h`}
            colorClassName="stroke-warning"
          />
          <RadialGauge
            value={Math.min(100, (indicators.mtbfHours / 720) * 100)}
            label="MTBF"
            sublabel={`${indicators.mtbfHours}h`}
            colorClassName="stroke-info"
          />
        </CardContent>
      </Card>

      {/* Linha 1 de gráficos */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Status das OS">
          <PieChart data={charts.statusPie} labelMap={STATUS_LABELS} />
        </ChartCard>
        <ChartCard title="Corretiva x Preventiva">
          <PieChart data={charts.correctivePreventiveDonut} labelMap={MAINTENANCE_TYPE_LABELS} donut />
        </ChartCard>
        <ChartCard title="OS por Especialidade">
          <BarChart data={charts.bySpecialty.map((d) => ({ ...d, label: SPECIALTY_LABELS[d.label as keyof typeof SPECIALTY_LABELS] ?? d.label }))} colorIndex={2} />
        </ChartCard>
      </div>

      {/* Linha 2 de gráficos */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="OS por Setor">
          <BarChart data={charts.bySector} horizontal colorIndex={0} />
        </ChartCard>
        <ChartCard title="OS por Responsável">
          <BarChart data={charts.byResponsible} horizontal colorIndex={4} />
        </ChartCard>
      </div>

      {/* Linha 3: séries temporais */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Quantidade de OS por mês">
          <LineChart data={charts.monthlyCountSeries} colorIndex={0} />
        </ChartCard>
        <ChartCard title="Custos por mês">
          <LineChart data={charts.monthlyCostSeries} valueFormatter={(v) => formatCurrency(v)} colorIndex={1} />
        </ChartCard>
      </div>

      <ChartCard title="Custos por Setor">
        <BarChart data={charts.costBySector} valueFormatter={(v) => formatCurrency(v)} colorIndex={3} />
      </ChartCard>

      <ChartCard title="Quantidade de chamados por dia">
        <CallsHeatmap data={charts.heatmap} />
      </ChartCard>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-foreground">Últimas atividades</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ActivityTimeline items={timeline} />
        </CardContent>
      </Card>
    </div>
  );
}
