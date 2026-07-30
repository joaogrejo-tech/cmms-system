import cron from 'node-cron';
import { prisma } from '@/config/prisma';
import { logger } from '@/config/logger';
import { PreventiveService } from '@/modules/preventive/preventive.service';

const preventiveService = new PreventiveService();

/**
 * Busca (ou cria, na primeira execução) um usuário de sistema para figurar
 * como solicitante das OS geradas automaticamente pelas rotinas de PCM.
 */
async function getSystemUserId(): Promise<string | null> {
  const systemUser = await prisma.user.findFirst({ where: { role: 'PCM' }, orderBy: { createdAt: 'asc' } });
  return systemUser?.id ?? null;
}

async function runPreventiveGenerationJob() {
  const systemUserId = await getSystemUserId();
  if (!systemUserId) {
    logger.warn('Job de preventivas ignorado: nenhum usuário PCM cadastrado para ser o solicitante.');
    return;
  }
  const created = await preventiveService.runDailyGeneration(systemUserId);
  logger.info(`Job de preventivas: ${created.length} OS geradas automaticamente.`);
}

async function runLateWorkOrderNotificationJob() {
  const lateWorkOrders = await prisma.workOrder.findMany({
    where: {
      status: { notIn: ['CONCLUIDA', 'CANCELADA'] },
      dueAt: { lt: new Date() },
    },
    include: { assignedTo: true },
  });

  for (const wo of lateWorkOrders) {
    if (!wo.assignedToId) continue;
    const existing = await prisma.notification.findFirst({
      where: { userId: wo.assignedToId, type: 'OS_ATRASADA', entityId: String(wo.id), read: false },
    });
    if (existing) continue;

    await prisma.notification.create({
      data: {
        userId: wo.assignedToId,
        type: 'OS_ATRASADA',
        title: 'OS atrasada',
        message: `A OS ${wo.code} está atrasada em relação ao SLA/prazo.`,
        entityId: String(wo.id),
      },
    });
  }

  logger.info(`Job de OS atrasadas: ${lateWorkOrders.length} verificadas.`);
}

async function runLowStockNotificationJob() {
  const lowStockParts = await prisma.part.findMany({
    where: { active: true },
  });

  const belowMinimum = lowStockParts.filter((p) => p.quantity.toNumber() <= p.minStock.toNumber());
  const pcmUsers = await prisma.user.findMany({ where: { role: { in: ['PCM', 'ADMIN'] } } });

  for (const part of belowMinimum) {
    for (const user of pcmUsers) {
      const existing = await prisma.notification.findFirst({
        where: { userId: user.id, type: 'ESTOQUE_BAIXO', entityId: part.id, read: false },
      });
      if (existing) continue;

      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'ESTOQUE_BAIXO',
          title: 'Estoque baixo',
          message: `A peça "${part.name}" está abaixo do estoque mínimo (${part.quantity}/${part.minStock}).`,
          entityId: part.id,
        },
      });
    }
  }

  logger.info(`Job de estoque baixo: ${belowMinimum.length} peças abaixo do mínimo.`);
}

/** Registra todos os cron jobs do sistema. Chamado uma única vez no bootstrap do servidor. */
export function registerScheduledJobs() {
  // Todos os dias às 06:00 — gera OS de preventivas vencidas.
  cron.schedule('0 6 * * *', () => {
    runPreventiveGenerationJob().catch((err) => logger.error(err, 'Falha no job de preventivas'));
  });

  // A cada hora — verifica OS atrasadas e notifica responsáveis.
  cron.schedule('0 * * * *', () => {
    runLateWorkOrderNotificationJob().catch((err) => logger.error(err, 'Falha no job de OS atrasadas'));
  });

  // Todos os dias às 07:00 — verifica estoque baixo.
  cron.schedule('0 7 * * *', () => {
    runLowStockNotificationJob().catch((err) => logger.error(err, 'Falha no job de estoque baixo'));
  });

  logger.info('⏰ Jobs agendados registrados (preventivas, SLA, estoque).');
}
