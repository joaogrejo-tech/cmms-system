import { Prisma, PurchaseStatus } from '@prisma/client';
import { prisma } from '@/config/prisma';
import { NotFoundError, AppError } from '@/shared/errors/AppError';
import { parsePagination, buildPaginatedResponse } from '@/shared/utils/pagination';
import { generateSequentialCode } from '@/shared/utils/codeGenerator';
import { CreatePurchaseOrderDTO, ListPurchaseOrdersQueryDTO, UpdatePurchaseOrderDTO } from './purchase.dto';

const ALLOWED_TRANSITIONS: Record<PurchaseStatus, PurchaseStatus[]> = {
  SOLICITACAO: [PurchaseStatus.EM_COTACAO, PurchaseStatus.CANCELADO],
  EM_COTACAO: [PurchaseStatus.PEDIDO_EMITIDO, PurchaseStatus.CANCELADO],
  PEDIDO_EMITIDO: [PurchaseStatus.MATERIAL_RECEBIDO, PurchaseStatus.CANCELADO],
  MATERIAL_RECEBIDO: [],
  CANCELADO: [],
};

export class PurchaseService {
  async list(query: ListPurchaseOrdersQueryDTO) {
    const { skip, take, page, perPage } = parsePagination(query);
    const where: Prisma.PurchaseOrderWhereInput = { status: query.status, supplierId: query.supplierId };

    const [items, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: { supplier: true, items: true },
        orderBy: { requestedAt: 'desc' },
        skip,
        take,
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, perPage);
  }

  async findById(id: string) {
    const order = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { supplier: true, items: { include: { part: true } } },
    });
    if (!order) throw new NotFoundError('Pedido de compra');
    return order;
  }

  async create(data: CreatePurchaseOrderDTO, requestedById: string) {
    const code = await generateSequentialCode('purchaseOrder', 'PC');
    const totalValue = data.items.reduce((sum, item) => sum + item.quantity * item.unitValue, 0);

    return prisma.purchaseOrder.create({
      data: {
        code,
        supplierId: data.supplierId,
        requestedById,
        quotationDeadline: data.quotationDeadline,
        expectedAt: data.expectedAt,
        notes: data.notes,
        totalValue,
        items: { create: data.items },
      },
      include: { supplier: true, items: true },
    });
  }

  async update(id: string, data: UpdatePurchaseOrderDTO) {
    await this.ensureExists(id);
    return prisma.purchaseOrder.update({ where: { id }, data, include: { supplier: true, items: true } });
  }

  async changeStatus(id: string, status: PurchaseStatus) {
    const current = await this.ensureExists(id);

    if (current.status !== status && !ALLOWED_TRANSITIONS[current.status].includes(status)) {
      throw new AppError(`Não é possível mudar o status de "${current.status}" para "${status}".`, 422);
    }

    const updateData: Prisma.PurchaseOrderUpdateInput = { status };
    if (status === PurchaseStatus.MATERIAL_RECEBIDO) {
      updateData.receivedAt = new Date();
    }

    const order = await prisma.purchaseOrder.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });

    // Ao confirmar recebimento, dá entrada automática no estoque das peças vinculadas.
    if (status === PurchaseStatus.MATERIAL_RECEBIDO) {
      await prisma.$transaction(
        order.items
          .filter((item) => item.partId)
          .flatMap((item) => [
            prisma.part.update({
              where: { id: item.partId! },
              data: { quantity: { increment: item.quantity } },
            }),
            prisma.stockMovement.create({
              data: {
                partId: item.partId!,
                type: 'ENTRADA',
                quantity: item.quantity,
                reason: `Recebimento do pedido de compra ${order.code}`,
                createdById: order.requestedById,
              },
            }),
          ]),
      );
    }

    return order;
  }

  private async ensureExists(id: string) {
    const order = await prisma.purchaseOrder.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw new NotFoundError('Pedido de compra');
    return order;
  }
}
