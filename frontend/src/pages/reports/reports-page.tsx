import { FileSpreadsheet, FileText, FileDown, ClipboardList, Wallet, CalendarClock, Users, MapPin, Cog } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import { exportToCsv, exportToExcel, exportToPdf } from '@/lib/export';
import { useDashboardSummary, useCostByAsset } from '@/hooks/use-dashboard';
import { usePreventivePlans } from '@/hooks/use-preventive';
import {
  MAINTENANCE_TYPE_LABELS,
  PRIORITY_LABELS,
  SPECIALTY_LABELS,
  STATUS_LABELS,
  formatCurrency,
  formatDate,
} from '@/lib/domain';

interface ReportDefinition {
  key: string;
  title: string;
  description: string;
  icon: any;
  getRows: () => Promise<Record<string, unknown>[]>;
}

export default function ReportsPage() {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const { data: dashboard } = useDashboardSummary();
  const { data: costByAsset } = useCostByAsset();
  const { data: preventivePlans } = usePreventivePlans({ perPage: 200, active: 'true' });

  const reports: ReportDefinition[] = [
    {
      key: 'work-orders',
      title: 'Ordens de Serviço',
      description: 'Lista completa de OS com status, prioridade e custo.',
      icon: ClipboardList,
      getRows: async () => {
        const { data } = await api.get('/work-orders', { params: { perPage: 500 } });
        return data.data.map((wo: any) => ({
          Código: wo.code,
          Descrição: wo.description,
          Setor: wo.sector.name,
          Especialidade: SPECIALTY_LABELS[wo.specialty as keyof typeof SPECIALTY_LABELS],
          Tipo: MAINTENANCE_TYPE_LABELS[wo.maintenanceType as keyof typeof MAINTENANCE_TYPE_LABELS],
          Prioridade: PRIORITY_LABELS[wo.priority as keyof typeof PRIORITY_LABELS],
          Status: STATUS_LABELS[wo.status as keyof typeof STATUS_LABELS],
          Responsável: wo.assignedTo?.name ?? 'Não atribuído',
          'Data de abertura': formatDate(wo.openedAt),
          'Dias em aberto': wo.daysOpen,
          Custo: wo.totalCost,
        }));
      },
    },
    {
      key: 'costs',
      title: 'Custos',
      description: 'Custo total por setor no período analisado.',
      icon: Wallet,
      getRows: async () => (dashboard?.charts.costBySector ?? []).map((c) => ({ Setor: c.label, Custo: formatCurrency(c.value) })),
    },
    {
      key: 'preventive',
      title: 'Preventivas',
      description: 'Planos preventivos ativos e seus vencimentos.',
      icon: CalendarClock,
      getRows: async () =>
        (preventivePlans?.data ?? []).map((p) => ({
          Plano: p.name,
          Ativo: `${p.asset.name} (${p.asset.tag})`,
          Setor: p.asset.sector.name,
          Especialidade: SPECIALTY_LABELS[p.specialty],
          'Próximo vencimento': formatDate(p.nextDueAt),
          Situação: p.isOverdue ? 'Atrasada' : p.isDueThisWeek ? 'Esta semana' : 'Em dia',
        })),
    },
    {
      key: 'responsible',
      title: 'Responsáveis',
      description: 'Quantidade de OS por técnico responsável.',
      icon: Users,
      getRows: async () => (dashboard?.charts.byResponsible ?? []).map((r) => ({ Responsável: r.label, 'Qtd. de OS': r.value })),
    },
    {
      key: 'sectors',
      title: 'Setores',
      description: 'Quantidade de OS por setor da planta.',
      icon: MapPin,
      getRows: async () => (dashboard?.charts.bySector ?? []).map((s) => ({ Setor: s.label, 'Qtd. de OS': s.value })),
    },
    {
      key: 'assets',
      title: 'Máquinas',
      description: 'Custo acumulado por ativo/equipamento.',
      icon: Cog,
      getRows: async () => (costByAsset ?? []).map((a) => ({ Máquina: a.label, Custo: formatCurrency(a.value) })),
    },
  ];

  const handleExport = async (report: ReportDefinition, format: 'csv' | 'excel' | 'pdf') => {
    setLoadingKey(`${report.key}-${format}`);
    try {
      const rows = await report.getRows();
      if (rows.length === 0) {
        toast.warning('Não há dados para exportar neste relatório.');
        return;
      }
      if (format === 'csv') exportToCsv(report.key, rows);
      if (format === 'excel') exportToExcel(report.key, rows, report.title);
      if (format === 'pdf') exportToPdf(report.title, rows);
    } catch {
      toast.error('Não foi possível gerar o relatório.');
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Exporte os dados do sistema em PDF, Excel ou CSV.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.key}>
            <CardContent className="space-y-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <report.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{report.title}</p>
                <p className="text-xs text-muted-foreground">{report.description}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" loading={loadingKey === `${report.key}-csv`} onClick={() => handleExport(report, 'csv')}>
                  <FileDown className="h-3.5 w-3.5" /> CSV
                </Button>
                <Button variant="outline" size="sm" className="flex-1" loading={loadingKey === `${report.key}-excel`} onClick={() => handleExport(report, 'excel')}>
                  <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
                </Button>
                <Button variant="outline" size="sm" className="flex-1" loading={loadingKey === `${report.key}-pdf`} onClick={() => handleExport(report, 'pdf')}>
                  <FileText className="h-3.5 w-3.5" /> PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
