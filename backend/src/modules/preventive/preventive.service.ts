import { FrequencyUnit, MaintenanceType, Priority, WorkOrderStatus } from '@prisma/client';
import { prisma } from '@/config/prisma';
import { NotFoundError } from '@/shared/errors/AppError';
import { parsePagination, buildPaginatedResponse } from '@/shared/utils/pagination';
import { generateSequentialCode } from '@/shared/utils/codeGenerator';
import { DEFAULT_SLA_HOURS } from '@/shared/utils/workOrderStatusMachine';
import { CreatePreventivePlanDTO, ListPreventivePlansQueryDTO, UpdatePreventivePlanDTO } from './preventive.dto';

function addByFrequency(date: Date, value: number, unit: FrequencyUnit): Date {
  const result = new Date(date);
  switch (unit) {
    case 'DIAS':
      result.setDate(result.getDate() + value);
      break;
    case 'SEMANAS':
      result.setDate(result.getDate() + value * 7);
      break;
    case 'MESES':
      result.setMonth(result.getMonth() + value);
      break;
    case 'ANOS':
      result.setFullYear(result.getFullYear() + value);
      break;
    case 'HORAS_USO':
      // Frequência baseada em horímetro: o vencimento por data serve apenas como
      // fallback de segurança; o gatilho real deve vir da leitura do medidor (Tela de Ativos).
      result.setDate(result.getDate() + 30);
      break;
  }
  return result;
}

export class PreventiveService {
  async list(query: ListPreventivePlansQueryDTO) {
    const { skip, take, page, perPage } = parsePagination(query);

    const where = {
      assetId: query.assetId,
      specialty: query.specialty,
      active: query.active ? query.active === 'true' : undefined,
    };

    const [items, total] = await Promise.all([
      prisma.preventivePlan.findMany({
        where,
        include: { asset: { select: { id: true, name: true, tag: true, sector: true } } },
        orderBy: { nextDueAt: 'asc' },
        skip,
        take,
      }),
      prisma.preventivePlan.count({ where }),
    ]);

    const today = new Date();
    const in7Days = new Date();
    in7Days.setDate(today.getDate() + 7);

    const data = items.map((plan) => ({
      ...plan,
      isOverdue: plan.nextDueAt < today,
      isDueThisWeek: plan.nextDueAt >= today && plan.nextDueAt <= in7Days,
    }));

    return buildPaginatedResponse(data, total, page, perPage);
  }

  async findById(id: string) {
    const plan = await prisma.preventivePlan.findUnique({
      where: { id },
      include: {
        asset: true,
        workOrders: { orderBy: { openedAt: 'desc' }, take: 10 },
      },
    });
    if (!plan) throw new NotFoundError('Plano preventivo');
    return plan;
  }

  async create(data: CreatePreventivePlanDTO) {
    return prisma.preventivePlan.create({
      data: {
        ...data,
        checklistTemplate: data.checklistTemplate ?? undefined,
      },
      include: { asset: true },
    });
  }

  async update(id: string, data: UpdatePreventivePlanDTO) {
    await this.ensureExists(id);
    return prisma.preventivePlan.update({ where: { id }, data, include: { asset: true } });
  }

  async delete(id: string) {
    await this.ensureExists(id);
    await prisma.preventivePlan.update({ where: { id }, data: { active: false } });
  }

  /**
   * Gera manualmente a OS de um plano específico (usado pelo botão "Gerar OS agora"
   * na Tela de Preventivas), e recalcula o próximo vencimento.
   */
  async generateWorkOrderNow(planId: string, requesterId: string) {
    const plan = await this.ensureExists(planId);
    return this.createWorkOrderFromPlan(plan, requesterId);
  }

  /**
   * Rotina executada pelo job diário (node-cron): busca todos os planos vencidos
   * que ainda não geraram OS para o ciclo atual e cria as OS automaticamente.
   */
  async runDailyGeneration(systemUserId: string) {
    const duePlans = await prisma.preventivePlan.findMany({
      where: { active: true, nextDueAt: { lte: new Date() } },
    });

    const created = [];
    for (const plan of duePlans) {
      const workOrder = await this.createWorkOrderFromPlan(plan, systemUserId);
      created.push(workOrder);
    }
    return created;
  }

  private async createWorkOrderFromPlan(
    plan: Awaited<ReturnType<PreventiveService['ensureExists']>>,
    requesterId: string,
  ) {
    const asset = await prisma.asset.findUnique({ where: { id: plan.assetId } });
    if (!asset) throw new NotFoundError('Ativo do plano preventivo');

    const code = await generateSequentialCode('workOrder', 'OS');
    const nextDueAt = addByFrequency(plan.nextDueAt, plan.frequencyValue, plan.frequencyUnit);

    const [workOrder] = await prisma.$transaction([
      prisma.workOrder.create({
        data: {
          code,
          description: `[Preventiva] ${plan.name}`,
          detailedNotes: plan.instructions,
          specialty: plan.specialty,
          sectorId: asset.sectorId,
          maintenanceType: MaintenanceType.PREVENTIVA,
          priority: Priority.MEDIA,
          requesterId,
          assetId: plan.assetId,
          preventivePlanId: plan.id,
          status: WorkOrderStatus.ABERTA,
          slaHours: DEFAULT_SLA_HOURS.MEDIA,
          checklistItems: {
            create: (Array.isArray(plan.checklistTemplate) ? (plan.checklistTemplate as string[]) : []).map(
              (description, index) => ({ description, order: index }),
            ),
          },
          history: {
            create: { toStatus: WorkOrderStatus.ABERTA, note: 'OS gerada automaticamente a partir do plano preventivo.' },
          },
        },
      }),
      prisma.preventivePlan.update({
        where: { id: plan.id },
        data: { lastGeneratedAt: new Date(), nextDueAt },
      }),
    ]);

    return workOrder;
  }

  private async ensureExists(id: string) {
    const plan = await prisma.preventivePlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundError('Plano preventivo');
    return plan;
  }
}
