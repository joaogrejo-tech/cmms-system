import { WorkOrderStatus, Priority } from '@prisma/client';
import { AppError } from '@/shared/errors/AppError';

/**
 * Define quais transições de status são permitidas a partir de cada estado atual.
 * Evita que a OS "pule" etapas de forma inconsistente (ex: ABERTA -> CONCLUIDA
 * direto, sem passar por execução).
 */
const ALLOWED_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  ABERTA: [WorkOrderStatus.EM_ANALISE, WorkOrderStatus.EM_ANDAMENTO, WorkOrderStatus.CANCELADA],
  EM_ANALISE: [WorkOrderStatus.EM_ANDAMENTO, WorkOrderStatus.AGUARDANDO_PECA, WorkOrderStatus.CANCELADA],
  AGUARDANDO_PECA: [WorkOrderStatus.EM_ANDAMENTO, WorkOrderStatus.PAUSADA, WorkOrderStatus.CANCELADA],
  EM_ANDAMENTO: [WorkOrderStatus.PAUSADA, WorkOrderStatus.AGUARDANDO_PECA, WorkOrderStatus.CONCLUIDA, WorkOrderStatus.CANCELADA],
  PAUSADA: [WorkOrderStatus.EM_ANDAMENTO, WorkOrderStatus.CANCELADA],
  CONCLUIDA: [],
  CANCELADA: [],
};

export function assertValidTransition(from: WorkOrderStatus, to: WorkOrderStatus) {
  if (from === to) return;
  if (!ALLOWED_TRANSITIONS[from].includes(to)) {
    throw new AppError(
      `Não é possível mudar o status de "${from}" para "${to}".`,
      422,
    );
  }
}

/** SLA padrão (em horas) por prioridade, usado quando a OS não define um valor customizado. */
export const DEFAULT_SLA_HOURS: Record<Priority, number> = {
  URGENTE: 4,
  ALTA: 8,
  MEDIA: 24,
  BAIXA: 72,
};
