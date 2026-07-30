export type Role = 'ADMIN' | 'PCM' | 'MECANICO' | 'ELETRICISTA' | 'SUPERVISOR' | 'SOLICITANTE';

export type WorkOrderStatus =
  | 'ABERTA'
  | 'EM_ANALISE'
  | 'AGUARDANDO_PECA'
  | 'EM_ANDAMENTO'
  | 'PAUSADA'
  | 'CONCLUIDA'
  | 'CANCELADA';

export type Priority = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';

export type Specialty =
  | 'MECANICA'
  | 'ELETRICA'
  | 'INSTRUMENTACAO'
  | 'AUTOMACAO'
  | 'CIVIL'
  | 'UTILIDADES'
  | 'REFRIGERACAO'
  | 'ENVASE'
  | 'QUALIDADE'
  | 'OUTROS';

export type MaintenanceType = 'CORRETIVA' | 'PREVENTIVA' | 'PREDITIVA' | 'MELHORIA' | 'INSPECAO' | 'LUBRIFICACAO' | 'CALIBRACAO';

export type AssetCriticality = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
export type AssetStatus = 'OPERACIONAL' | 'EM_MANUTENCAO' | 'PARADO' | 'DESATIVADO' | 'RESERVA';
export type PurchaseStatus = 'SOLICITACAO' | 'EM_COTACAO' | 'PEDIDO_EMITIDO' | 'MATERIAL_RECEBIDO' | 'CANCELADO';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  specialty?: Specialty | null;
  avatarUrl?: string | null;
  sectorId?: string | null;
}

export interface Sector {
  id: string;
  name: string;
  costCenter?: string | null;
}

export interface WorkOrderSummary {
  id: number;
  code: string;
  description: string;
  specialty: Specialty;
  maintenanceType: MaintenanceType;
  priority: Priority;
  status: WorkOrderStatus;
  subStatus?: string | null;
  openedAt: string;
  dueAt?: string | null;
  totalCost: number;
  daysOpen: number;
  isLate: boolean;
  slaCompliant: boolean;
  sector: Sector;
  requester: { id: string; name: string; avatarUrl?: string | null };
  assignedTo?: { id: string; name: string; avatarUrl?: string | null } | null;
  asset?: { id: string; name: string; tag: string } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export interface DashboardSummary {
  cards: {
    totalWorkOrders: number;
    pendingWorkOrders: number;
    inProgressWorkOrders: number;
    completedWorkOrders: number;
    lateWorkOrders: number;
    highPriorityWorkOrders: number;
    costThisMonth: number;
    costThisYear: number;
    averageResolutionTimeHours: number;
    backlog: number;
  };
  charts: {
    statusPie: { label: string; value: number }[];
    bySector: { label: string; value: number }[];
    bySpecialty: { label: string; value: number }[];
    byResponsible: { label: string; value: number }[];
    costBySector: { label: string; value: number }[];
    monthlyCountSeries: { label: string; value: number }[];
    monthlyCostSeries: { label: string; value: number }[];
    correctivePreventiveDonut: { label: string; value: number }[];
    heatmap: { date: string; value: number }[];
  };
  timeline: Array<{
    id: string;
    fromStatus: WorkOrderStatus | null;
    toStatus: WorkOrderStatus | null;
    note: string | null;
    createdAt: string;
    user: { id: string; name: string; avatarUrl?: string | null } | null;
    workOrder: { id: number; code: string; description: string };
  }>;
  indicators: {
    mttrHours: number;
    mtbfHours: number;
    availabilityPercent: number;
    slaCompliancePercent: number;
  };
}
