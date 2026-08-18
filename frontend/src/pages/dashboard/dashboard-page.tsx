import { useState, useRef } from 'react';
import {
  ClipboardList,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  Timer,
  Flame,
  Layers,
  Printer,
  Calendar,
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
import { Button } from '@/components/ui/button';
import { STATUS_LABELS, SPECIALTY_LABELS, MAINTENANCE_TYPE_LABELS, formatCurrency } from '@/lib/domain';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function DashboardPage() {
  // Estado para armazenar o mês selecionado no formato "YYYY-MM"
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  
  // Referência para o container principal que será impresso
  const printRef = useRef<HTMLDivElement>(null);

  // Calcula o dateFrom e dateTo com precisão absoluta de fuso horário
  let dateParams = undefined;
  if (selectedMonth) {
    const [year, month] = selectedMonth.split('-'); 
    // Primeiro dia do mês à 00:00:00
    const from = new Date(Number(year), Number(month) - 1, 1, 0, 0, 0);
    // Último dia do mês às 23:59:59
    const to = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);

    dateParams = {
      dateFrom: from.toISOString(),
      dateTo: to.toISOString(),
    };
  }

  // Repassando os parâmetros de data para o Hook
  const { data, isLoading } = useDashboardSummary(dateParams);

  // Função para exportar o Dashboard como PDF
  const handleExportPDF = async () => {
    if (!printRef.current) return;
    
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Relatorio_Dashboard_${selectedMonth || 'Geral'}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
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
      {/* Cabeçalho com Filtros e Botões */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-lg border">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard Executivo</h1>
          <p className="text-sm text-muted-foreground">Visão geral da manutenção em tempo real.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-background border px-3 py-1.5 rounded-md">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-sm outline-none border-none cursor-pointer"
            />
          </div>
          {(selectedMonth) && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedMonth('')}>
              Limpar Filtro
            </Button>
          )}
          <Button onClick={handleExportPDF} variant="default" className="gap-2">
            <Printer className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Container principal para captura do PDF */}
      <div ref={printRef} className="space-y-6 bg-background p-1">
        
        {/* Cards principais */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          <StatCard label="Total de OS" value={cards.totalWorkOrders} icon={ClipboardList} />
          <StatCard label="OS Pendentes" value={cards.pendingWorkOrders} icon={Clock} tone="warning" />
          <StatCard label="Em andamento" value={cards.inProgressWorkOrders} icon={Layers} />
          <StatCard label="Concluídas" value={cards.completedWorkOrders} icon={CheckCircle2} tone="success" />
          <StatCard label="Atrasadas" value={cards.lateWorkOrders} icon={AlertTriangle} tone="destructive" />
          <StatCard label="Alta prioridade" value={cards.highPriorityWorkOrders} icon={Flame} tone="warning" />
          <StatCard label="Custo" value={formatCurrency(cards.costThisMonth)} icon={Wallet} />
          <StatCard label="Custo Anual" value={formatCurrency(cards.costThisYear)} icon={Wallet} />
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
    </div>
  );
}