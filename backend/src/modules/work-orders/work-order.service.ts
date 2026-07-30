import { Prisma, WorkOrderStatus } from '@prisma/client';
import { prisma } from '@/config/prisma';
import { NotFoundError } from '@/shared/errors/AppError';
import { generateSequentialCode } from '@/shared/utils/codeGenerator';
import { parsePagination, buildPaginatedResponse } from '@/shared/utils/pagination';
import { diffInDays } from '@/shared/utils/date';
import { assertValidTransition, DEFAULT_SLA_HOURS } from '@/shared/utils/workOrderStatusMachine';
import {
  ChangeStatusDTO,
  CreateWorkOrderDTO,
  ListWorkOrdersQueryDTO,
  UpdateWorkOrderDTO,
} from './work-order.dto';

const WORK_ORDER_SORT_FIELDS = ['openedAt', 'priority', 'status', 'dueAt', 'totalCost', 'code'];

const listInclude = {
  sector: true,
  requester: { select: { id: true, name: true, avatarUrl: true } },
  assignedTo: { select: { id: true, name: true, avatarUrl: true } },
  asset: { select: { id: true, name: true, tag: true } },
} satisfies Prisma.WorkOrderInclude;

const detailInclude = {
  ...listInclude,
  history: { orderBy: { createdAt: 'desc' as const }, include: { user: { select: { id: true, name: true } } } },
  comments: { orderBy: { createdAt: 'desc' as const }, include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
  attachments: { orderBy: { createdAt: 'desc' as const } },
  checklistItems: { orderBy: { order: 'asc' as const } },
  partsUsed: { include: { part: true } },
  laborEntries: { include: { user: { select: { id: true, name: true } } } },
  preventivePlan: true,
} satisfies Prisma.WorkOrderInclude;

function withComputedFields<
  T extends { openedAt: Date; finishedAt: Date | null; slaHours: number | null; priority: keyof typeof DEFAULT_SLA_HOURS },
>(wo: T) {
  const reference = wo.finishedAt ?? new Date();
  const daysOpen = Math.floor(diffInDays(wo.openedAt, reference));
  const effectiveSlaHours = wo.slaHours ?? DEFAULT_SLA_HOURS[wo.priority];
  const hoursOpen = (reference.getTime() - wo.openedAt.getTime()) / (1000 * 60 * 60);
  const isLate = !wo.finishedAt && hoursOpen > effectiveSlaHours;
  const slaCompliant = wo.finishedAt ? hoursOpen <= effectiveSlaHours : !isLate;

  return { ...wo, daysOpen, isLate, slaCompliant, effectiveSlaHours };
}

export class WorkOrderService {
  async list(query: ListWorkOrdersQueryDTO) {
    const { skip, take, page, perPage, orderBy } = parsePagination(
      query,
      WORK_ORDER_SORT_FIELDS,
      'openedAt',
    );

    const where: Prisma.WorkOrderWhereInput = {
      status: query.status,
      priority: query.priority,
      specialty: query.specialty,
      maintenanceType: query.maintenanceType,
      sectorId: query.sectorId,
      assignedToId: query.assignedToId,
      requesterId: query.requesterId,
      openedAt: {
        gte: query.dateFrom,
        lte: query.dateTo,
      },
      OR: query.search
        ? [
            { description: { contains: query.search, mode: 'insensitive' } },
            { code: { contains: query.search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    if (query.onlyLate === 'true') {
      where.status = { notIn: [WorkOrderStatus.CONCLUIDA, WorkOrderStatus.CANCELADA] };
      where.dueAt = { lt: new Date() };
    }

    const [items, total] = await Promise.all([
      prisma.workOrder.findMany({ where, include: listInclude, skip, take, orderBy }),
      prisma.workOrder.count({ where }),
    ]);

    const data = items.map((item) => withComputedFields(item));
    return buildPaginatedResponse(data, total, page, perPage);
  }

  async findById(id: number) {
    const workOrder = await prisma.workOrder.findUnique({ where: { id }, include: detailInclude });
    if (!workOrder) throw new NotFoundError('Ordem de Serviço');
    return withComputedFields(workOrder);
  }

  async create(data: CreateWorkOrderDTO, requesterId: string) {
    const code = await generateSequentialCode('workOrder', 'OS');
    const slaHours = DEFAULT_SLA_HOURS[data.priority ?? 'MEDIA'];

    const workOrder = await prisma.workOrder.create({
      data: {
        code,
        description: data.description,
        detailedNotes: data.detailedNotes,
        specialty: data.specialty,
        sectorId: data.sectorId,
        maintenanceType: data.maintenanceType,
        priority: data.priority,
        assignedToId: data.assignedToId,
        assetId: data.assetId,
        dueAt: data.dueAt,
        slaHours,
        requesterId,
        status: WorkOrderStatus.ABERTA,
        history: {
          create: { toStatus: WorkOrderStatus.ABERTA, userId: requesterId, note: 'Ordem de serviço criada.' },
        },
      },
      include: listInclude,
    });

    if (workOrder.assignedToId) {
      await prisma.notification.create({
        data: {
          userId: workOrder.assignedToId,
          type: 'OS_ATRIBUIDA',
          title: 'Nova OS atribuída a você',
          message: `A OS ${workOrder.code} foi atribuída a você.`,
          entityId: String(workOrder.id),
        },
      });
    }

    return workOrder;
  }

  async update(id: number, data: UpdateWorkOrderDTO) {
    await this.findById(id);
    return prisma.workOrder.update({
      where: { id },
      data,
      include: listInclude,
    });
  }

  async changeStatus(id: number, dto: ChangeStatusDTO, userId: string) {
    const current = await prisma.workOrder.findUnique({ where: { id } });
    if (!current) throw new NotFoundError('Ordem de Serviço');

    assertValidTransition(current.status, dto.status);

    const updateData: Prisma.WorkOrderUpdateInput = {
      status: dto.status,
      subStatus: dto.subStatus,
    };

    if (dto.status === WorkOrderStatus.EM_ANDAMENTO && !current.startedAt) {
      updateData.startedAt = new Date();
    }
    if (dto.status === WorkOrderStatus.CONCLUIDA) {
      updateData.finishedAt = new Date();
    }

    const [workOrder] = await prisma.$transaction([
      prisma.workOrder.update({ where: { id }, data: updateData, include: listInclude }),
      prisma.workOrderHistory.create({
        data: {
          workOrderId: id,
          userId,
          fromStatus: current.status,
          toStatus: dto.status,
          note: dto.note,
        },
      }),
    ]);

    return workOrder;
  }

  async delete(id: number) {
    await this.findById(id);
    await prisma.workOrder.delete({ where: { id } });
  }

  async addComment(workOrderId: number, userId: string, content: string) {
    await this.findById(workOrderId);
    return prisma.comment.create({
      data: { workOrderId, userId, content },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  async addChecklistItem(workOrderId: number, description: string, order?: number) {
    await this.findById(workOrderId);
    return prisma.checklistItem.create({
      data: { workOrderId, description, order: order ?? 0 },
    });
  }

  async toggleChecklistItem(itemId: string, done: boolean) {
    const item = await prisma.checklistItem.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundError('Item de checklist');
    return prisma.checklistItem.update({ where: { id: itemId }, data: { done } });
  }

  async addPart(workOrderId: number, partId: string, quantity: number, userId: string) {
    await this.findById(workOrderId);

    return prisma.$transaction(async (tx) => {
      const part = await tx.part.findUnique({ where: { id: partId } });
      if (!part) throw new NotFoundError('Peça');
      if (part.quantity.toNumber() < quantity) {
        throw new NotFoundError('Estoque insuficiente para esta peça');
      }

      const woPart = await tx.workOrderPart.create({
        data: { workOrderId, partId, quantity, unitCost: part.unitCost },
        include: { part: true },
      });

      await tx.part.update({
        where: { id: partId },
        data: { quantity: { decrement: quantity } },
      });

      await tx.stockMovement.create({
        data: {
          partId,
          type: 'SAIDA',
          quantity,
          reason: `Uso na OS #${workOrderId}`,
          createdById: userId,
        },
      });

      const cost = quantity * part.unitCost.toNumber();
      await tx.workOrder.update({
        where: { id: workOrderId },
        data: { totalCost: { increment: cost } },
      });

      return woPart;
    });
  }

  async addLaborEntry(
    workOrderId: number,
    userId: string,
    hours: number,
    hourlyRate: number | undefined,
    date: Date | undefined,
    notes: string | undefined,
  ) {
    await this.findById(workOrderId);

    return prisma.$transaction(async (tx) => {
      const entry = await tx.laborEntry.create({
        data: { workOrderId, userId, hours, hourlyRate, date: date ?? new Date(), notes },
      });

      if (hourlyRate) {
        await tx.workOrder.update({
          where: { id: workOrderId },
          data: { totalCost: { increment: hours * hourlyRate } },
        });
      }

      return entry;
    });
  }

  async addAttachment(
    workOrderId: number,
    uploadedById: string,
    file: { fileName: string; fileUrl: string; fileType: string; fileSize: number },
  ) {
    await this.findById(workOrderId);
    return prisma.attachment.create({
      data: { workOrderId, uploadedById, ...file },
    });
  }
}
