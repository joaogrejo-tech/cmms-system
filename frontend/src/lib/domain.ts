import type { AssetCriticality, MaintenanceType, Priority, PurchaseStatus, Role, Specialty, WorkOrderStatus } from '@/types';

export const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  ABERTA: 'Aberta',
  EM_ANALISE: 'Em análise',
  AGUARDANDO_PECA: 'Aguardando peça',
  EM_ANDAMENTO: 'Em andamento',
  PAUSADA: 'Pausada',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};

export const STATUS_BADGE_VARIANT: Record<WorkOrderStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'muted' | 'info'> = {
  ABERTA: 'info',
  EM_ANALISE: 'secondary',
  AGUARDANDO_PECA: 'warning',
  EM_ANDAMENTO: 'default',
  PAUSADA: 'muted',
  CONCLUIDA: 'success',
  CANCELADA: 'muted',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
};

export const PRIORITY_BADGE_VARIANT: Record<Priority, 'muted' | 'info' | 'warning' | 'destructive'> = {
  BAIXA: 'muted',
  MEDIA: 'info',
  ALTA: 'warning',
  URGENTE: 'destructive',
};

export const SPECIALTY_LABELS: Record<Specialty, string> = {
  MECANICA: 'Mecânica',
  ELETRICA: 'Elétrica',
  INSTRUMENTACAO: 'Instrumentação',
  AUTOMACAO: 'Automação',
  CIVIL: 'Civil',
  UTILIDADES: 'Utilidades',
  REFRIGERACAO: 'Refrigeração',
  ENVASE: 'Envase',
  QUALIDADE: 'Qualidade',
  OUTROS: 'Outros',
};

export const MAINTENANCE_TYPE_LABELS: Record<MaintenanceType, string> = {
  CORRETIVA: 'Corretiva',
  PREVENTIVA: 'Preventiva',
  PREDITIVA: 'Preditiva',
  MELHORIA: 'Melhoria',
  INSPECAO: 'Inspeção',
  LUBRIFICACAO: 'Lubrificação',
  CALIBRACAO: 'Calibração',
};

export const CRITICALITY_LABELS: Record<AssetCriticality, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  CRITICA: 'Crítica',
};

export const PURCHASE_STATUS_LABELS: Record<PurchaseStatus, string> = {
  SOLICITACAO: 'Solicitação',
  EM_COTACAO: 'Em cotação',
  PEDIDO_EMITIDO: 'Pedido emitido',
  MATERIAL_RECEBIDO: 'Material recebido',
  CANCELADO: 'Cancelado',
};

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrador',
  PCM: 'PCM',
  MECANICO: 'Mecânico',
  ELETRICISTA: 'Eletricista',
  SUPERVISOR: 'Supervisor',
  SOLICITANTE: 'Solicitante',
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
}

export function formatDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
