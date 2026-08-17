import { Prisma, MaintenanceType } from '@prisma/client';
import { prisma } from '@/config/prisma';
import { diffInHours } from '@/shared/utils/date';
import { DEFAULT_SLA_HOURS } from '@/shared/utils/workOrderStatusMachine';
import { DashboardQueryDTO } from './dashboard.dto';

function buildDateRange(query: DashboardQueryDTO) {
  const now = new Date();
  const dateFrom = query.dateFrom ?? new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const dateTo = query.dateTo ?? now;
  return { dateFrom, dateTo };
}

export class DashboardService {
async getSummary(query: DashboardQueryDTO) {
    const { dateFrom, dateTo } = buildDateRange(query);
    const baseWhere: Prisma.WorkOrderWhereInput = {
      sectorId: query.sectorId,
      openedAt: { gte: dateFrom, lte: dateTo },
    };

    // 🚦 Em vez de Promise.all (tudo ao mesmo tempo), fazemos consultas sequenciais
    // Isso impede que o limite de conexões do banco gratuito seja estourado.
    const cards = await this.getCards(baseWhere);
    const statusPie = await this.getStatusPie(baseWhere);
    const bySector = await this.getBySector(baseWhere);
    const bySpecialty = await this.getBySpecialty(baseWhere);
    const byResponsible = await this.getByResponsible(baseWhere);
    const costBySector = await this.getCostBySector(baseWhere);
    const monthlySeries = await this.getMonthlySeries(baseWhere, dateFrom, dateTo);
    const correctivePreventive = await this.getCorrectivePreventiveDonut(baseWhere);
    const heatmap = await this.getHeatmap(baseWhere);
    const timeline = await this.getTimeline(query.sectorId);
    const indicators = await this.getIndicators(baseWhere, dateFrom, dateTo);

    return {
      cards,
      charts: {
        statusPie,
        bySector,
        bySpecialty,
        byResponsible,
        costBySector,
        monthlyCountSeries: monthlySeries.count,
        monthlyCostSeries: monthlySeries.cost,
        correctivePreventiveDonut: correctivePreventive,
        heatmap,
      },
      timeline,
      indicators,
    };
  }
  async getCostByAsset() {
    const grouped = await prisma.workOrder.groupBy({
      by: ['assetId'],
      where: { assetId: { not: null } },
      _sum: { totalCost: true },
      orderBy: { _sum: { totalCost: 'desc' } },
      take: 15,
    });

    const assetIds = grouped.map((g) => g.assetId).filter((v): v is string => Boolean(v));
    const assets = await prisma.asset.findMany({ where: { id: { in: assetIds } }, select: { id: true, name: true, tag: true } });
    const assetMap = Object.fromEntries(assets.map((a) => [a.id, `${a.name} (${a.tag})`]));

    return grouped.map((g) => ({
      label: g.assetId ? (assetMap[g.assetId] ?? 'Não encontrado') : 'Sem ativo',
      value: Number(g._sum.totalCost || 0),
    }));
  }

 private async getCards(baseWhere: Prisma.WorkOrderWhereInput) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // 🚦 Consultas sequenciais para poupar o banco
    const total = await prisma.workOrder.count({ where: baseWhere });
    const pending = await prisma.workOrder.count({ where: { ...baseWhere, status: { in: ['ABERTA', 'PENDENTE', 'EM_ANALISE'] } } });
    const inProgress = await prisma.workOrder.count({ where: { ...baseWhere, status: { in: ['EM_ANDAMENTO'] } } });
    const completed = await prisma.workOrder.count({ where: { ...baseWhere, status: { in: ['CONCLUIDA', 'CONCLUIDO', 'FINALIZADA'] } } });
    const late = await prisma.workOrder.count({
      where: { ...baseWhere, status: { notIn: ['CONCLUIDA', 'CONCLUIDO', 'FINALIZADA', 'CANCELADA', 'CANCELADO'] }, dueAt: { lt: now } },
    });
    const highPriority = await prisma.workOrder.count({ where: { ...baseWhere, priority: { in: ['ALTA', 'URGENTE'] } } });
    const costThisMonth = await prisma.workOrder.aggregate({ where: { openedAt: { gte: startOfMonth } }, _sum: { totalCost: true } });
    const costThisYear = await prisma.workOrder.aggregate({ where: { openedAt: { gte: startOfYear } }, _sum: { totalCost: true } });
    const avgResolutionRaw = await prisma.workOrder.findMany({
      where: { ...baseWhere, status: { in: ['CONCLUIDA', 'CONCLUIDO', 'FINALIZADA'] }, finishedAt: { not: null } },
      select: { openedAt: true, finishedAt: true },
    });

    // ... resto do código (cálculos de avgResolutionHours e backlog continuam iguais)private async getCards(baseWhere: Prisma.WorkOrderWhereInput) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // 🚦 Consultas sequenciais para poupar o banco
    const total = await prisma.workOrder.count({ where: baseWhere });
    const pending = await prisma.workOrder.count({ where: { ...baseWhere, status: { in: ['ABERTA', 'PENDENTE', 'EM_ANALISE'] } } });
    const inProgress = await prisma.workOrder.count({ where: { ...baseWhere, status: { in: ['EM_ANDAMENTO'] } } });
    const completed = await prisma.workOrder.count({ where: { ...baseWhere, status: { in: ['CONCLUIDA', 'CONCLUIDO', 'FINALIZADA'] } } });
    const late = await prisma.workOrder.count({
      where: { ...baseWhere, status: { notIn: ['CONCLUIDA', 'CONCLUIDO', 'FINALIZADA', 'CANCELADA', 'CANCELADO'] }, dueAt: { lt: now } },
    });
    const highPriority = await prisma.workOrder.count({ where: { ...baseWhere, priority: { in: ['ALTA', 'URGENTE'] } } });
    const costThisMonth = await prisma.workOrder.aggregate({ where: { openedAt: { gte: startOfMonth } }, _sum: { totalCost: true } });
    const costThisYear = await prisma.workOrder.aggregate({ where: { openedAt: { gte: startOfYear } }, _sum: { totalCost: true } });
    const avgResolutionRaw = await prisma.workOrder.findMany({
      where: { ...baseWhere, status: { in: ['CONCLUIDA', 'CONCLUIDO', 'FINALIZADA'] }, finishedAt: { not: null } },
      select: { openedAt: true, finishedAt: true },
    });

    // ... resto do código (cálculos de avgResolutionHours e backlog continuam iguais)

    const avgResolutionHours =
      avgResolutionRaw.length > 0
        ? avgResolutionRaw.reduce((sum, wo) => sum + diffInHours(wo.openedAt, wo.finishedAt!), 0) / avgResolutionRaw.length
        : 0;

    const backlog = pending + inProgress;

    return {
      totalWorkOrders: total,
      pendingWorkOrders: pending,
      inProgressWorkOrders: inProgress,
      completedWorkOrders: completed,
      lateWorkOrders: late,
      highPriorityWorkOrders: highPriority,
      costThisMonth: Number(costThisMonth._sum.totalCost || 0),
      costThisYear: Number(costThisYear._sum.totalCost || 0),
      averageResolutionTimeHours: Number(avgResolutionHours.toFixed(1)),
      backlog,
    };
  }

  private async getStatusPie(baseWhere: Prisma.WorkOrderWhereInput) {
    const grouped = await prisma.workOrder.groupBy({
      by: ['status'],
      where: baseWhere,
      _count: { _all: true },
    });
    return grouped.map((g) => ({ label: String(g.status || 'Desconhecido'), value: g._count._all }));
  }

  private async getBySector(baseWhere: Prisma.WorkOrderWhereInput) {
    const grouped = await prisma.workOrder.groupBy({
      by: ['sectorId'],
      where: baseWhere,
      _count: { _all: true },
    });

    const sectors = await prisma.sector.findMany({ select: { id: true, name: true } });
    const labelMap = Object.fromEntries(sectors.map((s) => [s.id, s.name]));

    return grouped
      .map((g) => ({ label: g.sectorId ? (labelMap[g.sectorId] ?? 'Não informado') : 'Não informado', value: g._count._all }))
      .sort((a, b) => b.value - a.value);
  }

  private async getBySpecialty(baseWhere: Prisma.WorkOrderWhereInput) {
    const grouped = await prisma.workOrder.groupBy({
      by: ['specialty'],
      where: baseWhere,
      _count: { _all: true },
    });

    return grouped
      .map((g) => ({ label: String(g.specialty || 'Não informada'), value: g._count._all }))
      .sort((a, b) => b.value - a.value);
  }

  private async getByResponsible(baseWhere: Prisma.WorkOrderWhereInput) {
    const grouped = await prisma.workOrder.groupBy({
      by: ['assignedToId'],
      where: baseWhere,
      _count: { _all: true },
    });

    const ids = grouped.map((g) => g.assignedToId).filter((v): v is string => Boolean(v));
    const users = await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } });
    const labelMap = Object.fromEntries(users.map((u) => [u.id, u.name]));

    return grouped
      .map((g) => ({
        label: g.assignedToId ? (labelMap[g.assignedToId] ?? 'Não encontrado') : 'Não atribuído',
        value: g._count._all,
      }))
      .sort((a, b) => b.value - a.value);
  }

  private async getCostBySector(baseWhere: Prisma.WorkOrderWhereInput) {
    const grouped = await prisma.workOrder.groupBy({
      by: ['sectorId'],
      where: baseWhere,
      _sum: { totalCost: true },
    });

    const sectors = await prisma.sector.findMany({ select: { id: true, name: true } });
    const sectorMap = Object.fromEntries(sectors.map((s) => [s.id, s.name]));

    return grouped
      .map((g) => ({ label: g.sectorId ? (sectorMap[g.sectorId] ?? 'Não informado') : 'Não informado', value: Number(g._sum.totalCost || 0) }))
      .sort((a, b) => b.value - a.value);
  }

  private async getMonthlySeries(baseWhere: Prisma.WorkOrderWhereInput, dateFrom: Date, dateTo: Date) {
    const workOrders = await prisma.workOrder.findMany({
      where: baseWhere,
      select: { openedAt: true, totalCost: true },
    });

    const months: string[] = [];
    const cursor = new Date(dateFrom.getFullYear(), dateFrom.getMonth(), 1);
    while (cursor <= dateTo) {
      months.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`);
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const countByMonth: Record<string, number> = Object.fromEntries(months.map((m) => [m, 0]));
    const costByMonth: Record<string, number> = Object.fromEntries(months.map((m) => [m, 0]));

    for (const wo of workOrders) {
      if (!wo.openedAt) continue;
      const key = `${wo.openedAt.getFullYear()}-${String(wo.openedAt.getMonth() + 1).padStart(2, '0')}`;
      if (key in countByMonth) {
        countByMonth[key] += 1;
        costByMonth[key] += Number(wo.totalCost || 0);
      }
    }

    return {
      count: months.map((m) => ({ label: m, value: countByMonth[m] })),
      cost: months.map((m) => ({ label: m, value: Number(costByMonth[m].toFixed(2)) })),
    };
  }

  private async getCorrectivePreventiveDonut(baseWhere: Prisma.WorkOrderWhereInput) {
    const grouped = await prisma.workOrder.groupBy({
      by: ['maintenanceType'],
      where: baseWhere,
      _count: { _all: true },
    });
    return grouped.map((g) => ({ label: String(g.maintenanceType || 'Não definido'), value: g._count._all }));
  }

  private async getHeatmap(baseWhere: Prisma.WorkOrderWhereInput) {
    const workOrders = await prisma.workOrder.findMany({ where: baseWhere, select: { openedAt: true } });
    const counts: Record<string, number> = {};
    for (const wo of workOrders) {
      if (!wo.openedAt) continue;
      const key = wo.openedAt.toISOString().slice(0, 10);
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private async getTimeline(sectorId?: string) {
    return prisma.workOrderHistory.findMany({
      where: sectorId ? { workOrder: { sectorId } } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        workOrder: { select: { id: true, code: true, description: true } },
      },
    });
  }

  private async getIndicators(baseWhere: Prisma.WorkOrderWhereInput, dateFrom: Date, dateTo: Date) {
    const correctiveCompleted = await prisma.workOrder.findMany({
      where: {
        ...baseWhere,
        maintenanceType: MaintenanceType.CORRETIVA,
        status: { in: ['CONCLUIDA', 'CONCLUIDO', 'FINALIZADA'] },
        finishedAt: { not: null },
      },
      select: { assetId: true, openedAt: true, startedAt: true, finishedAt: true },
      orderBy: { openedAt: 'asc' },
    });

    const repairDurations = correctiveCompleted.map((wo) =>
      diffInHours(wo.startedAt ?? wo.openedAt, wo.finishedAt!),
    );
    const mttrHours = repairDurations.length
      ? repairDurations.reduce((a, b) => a + b, 0) / repairDurations.length
      : 0;

    const byAsset = new Map<string, Date[]>();
    for (const wo of correctiveCompleted) {
      if (!wo.assetId) continue;
      const list = byAsset.get(wo.assetId) ?? [];
      list.push(wo.openedAt);
      byAsset.set(wo.assetId, list);
    }

    const gaps: number[] = [];
    for (const dates of byAsset.values()) {
      for (let i = 1; i < dates.length; i++) {
        gaps.push(diffInHours(dates[i - 1], dates[i]));
      }
    }
    const mtbfHours = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;

    const totalPeriodHours = diffInHours(dateFrom, dateTo) || 1;
    const totalDowntimeHours = repairDurations.reduce((a, b) => a + b, 0);
    const availabilityPercent = Math.max(0, Math.min(100, (1 - totalDowntimeHours / totalPeriodHours) * 100));

    const allClosedOrOpen = await prisma.workOrder.findMany({
      where: baseWhere,
      select: { priority: true, slaHours: true, openedAt: true, finishedAt: true, status: true },
    });
    
    const relevant = allClosedOrOpen.filter((wo) => wo.status !== 'CANCELADA' && wo.status !== 'CANCELADO');
    const compliant = relevant.filter((wo) => {
      // Se não achar o SLA pela prioridade, assume 24h como padrão seguro para não dar NaN
      const defaultSla = (wo.priority && DEFAULT_SLA_HOURS[wo.priority]) ? DEFAULT_SLA_HOURS[wo.priority] : 24;
      const sla = wo.slaHours ?? defaultSla;
      const reference = wo.finishedAt ?? new Date();
      return diffInHours(wo.openedAt, reference) <= sla;
    });
    const slaCompliancePercent = relevant.length ? (compliant.length / relevant.length) * 100 : 100;

    return {
      mttrHours: Number(mttrHours.toFixed(1)),
      mtbfHours: Number(mtbfHours.toFixed(1)),
      availabilityPercent: Number(availabilityPercent.toFixed(2)),
      slaCompliancePercent: Number(slaCompliancePercent.toFixed(1)),
    };
  }
}