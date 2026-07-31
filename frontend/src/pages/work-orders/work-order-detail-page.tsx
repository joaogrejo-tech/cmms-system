import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User as UserIcon, Wrench, MapPin } from 'lucide-react';
import { useWorkOrder } from '@/hooks/use-work-orders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusChanger } from '@/components/work-orders/status-changer';
import { CommentsPanel } from '@/components/work-orders/comments-panel';
import { ChecklistPanel } from '@/components/work-orders/checklist-panel';
import { PartsPanel } from '@/components/work-orders/parts-panel';
import { LaborPanel } from '@/components/work-orders/labor-panel';
import { AttachmentsPanel } from '@/components/work-orders/attachments-panel';
import { HistoryPanel } from '@/components/work-orders/history-panel';

import {
  MAINTENANCE_TYPE_LABELS,
  PRIORITY_BADGE_VARIANT,
  PRIORITY_LABELS,
  SPECIALTY_LABELS,
  STATUS_BADGE_VARIANT,
  STATUS_LABELS,
  formatCurrency,
  formatDateTime,
} from '@/lib/domain';

import type {
  MaintenanceType,
  Priority,
  Specialty,
  WorkOrderStatus,
} from '@/types';

export default function WorkOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: wo, isLoading } = useWorkOrder(
    id ? Number(id) : undefined,
  );

  if (isLoading || !wo) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const status = wo.status as WorkOrderStatus;
  const priority = wo.priority as Priority;
  const specialty = wo.specialty as Specialty;
  const maintenanceType = wo.maintenanceType as MaintenanceType;

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/work-orders')}
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Ordens de Serviço
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-data text-sm font-medium text-primary">
              {wo.code}
            </span>

            <Badge variant={STATUS_BADGE_VARIANT[status]}>
              {STATUS_LABELS[status]}
            </Badge>

            <Badge variant={PRIORITY_BADGE_VARIANT[priority]}>
              {PRIORITY_LABELS[priority]}
            </Badge>

            {wo.isLate && (
              <Badge variant="destructive">
                Atrasada
              </Badge>
            )}
          </div>

          <h1 className="text-xl font-semibold tracking-tight">
            {wo.description}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        <div className="space-y-4 lg:col-span-2">

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Informações gerais
              </CardTitle>
            </CardHeader>

            <CardContent className="grid grid-cols-2 gap-4 pt-0 text-sm sm:grid-cols-3">

              <Info
                icon={MapPin}
                label="Setor"
                value={wo.sector.name}
              />

              <Info
                icon={Wrench}
                label="Especialidade"
                value={SPECIALTY_LABELS[specialty]}
              />

              <Info
                icon={Wrench}
                label="Tipo"
                value={MAINTENANCE_TYPE_LABELS[maintenanceType]}
              />

              <Info
                icon={UserIcon}
                label="Solicitante"
                value={wo.requester.name}
              />

              <Info
                icon={UserIcon}
                label="Responsável"
                value={wo.assignedTo?.name ?? 'Não atribuído'}
              />

              <Info
                icon={Calendar}
                label="Abertura"
                value={formatDateTime(wo.openedAt)}
              />

              {wo.asset && (
                <Info
                  icon={Wrench}
                  label="Ativo"
                  value={`${wo.asset.name} (${wo.asset.tag})`}
                />
              )}

              <Info
                icon={Calendar}
                label="Dias em aberto"
                value={`${wo.daysOpen} dia(s)`}
              />

              <Info
                icon={Calendar}
                label="Custo total"
                value={formatCurrency(wo.totalCost)}
              />

            </CardContent>

            {wo.detailedNotes && (
              <CardContent className="pt-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Observações
                </p>

                <p className="mt-1 text-sm">
                  {wo.detailedNotes}
                </p>
              </CardContent>
            )}

          </Card>


          <Card>
            <CardContent className="pt-5">
              <Tabs defaultValue="comments">

                <TabsList>
                  <TabsTrigger value="comments">Comentários</TabsTrigger>
                  <TabsTrigger value="checklist">Checklist</TabsTrigger>
                  <TabsTrigger value="parts">Peças</TabsTrigger>
                  <TabsTrigger value="labor">Horas</TabsTrigger>
                  <TabsTrigger value="attachments">Arquivos</TabsTrigger>
                  <TabsTrigger value="history">Histórico</TabsTrigger>
                </TabsList>


                <TabsContent value="comments">
                  <CommentsPanel
                    workOrderId={wo.id}
                    comments={wo.comments}
                  />
                </TabsContent>

                <TabsContent value="checklist">
                  <ChecklistPanel
                    workOrderId={wo.id}
                    items={wo.checklistItems}
                  />
                </TabsContent>

                <TabsContent value="parts">
                  <PartsPanel
                    workOrderId={wo.id}
                    partsUsed={wo.partsUsed}
                  />
                </TabsContent>

                <TabsContent value="labor">
                  <LaborPanel
                    workOrderId={wo.id}
                    laborEntries={wo.laborEntries}
                  />
                </TabsContent>

                <TabsContent value="attachments">
                  <AttachmentsPanel
                    workOrderId={wo.id}
                    attachments={wo.attachments}
                  />
                </TabsContent>

                <TabsContent value="history">
                  <HistoryPanel history={wo.history}/>
                </TabsContent>

              </Tabs>
            </CardContent>
          </Card>

        </div>


        <div className="space-y-4">

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Mudar status
              </CardTitle>
            </CardHeader>

            <CardContent>
              <StatusChanger
                workOrderId={wo.id}
                currentStatus={status}
              />
            </CardContent>
          </Card>


          <Card>
  <CardHeader>
    <CardTitle className="text-sm font-semibold">
      Resumo de custos
    </CardTitle>
  </CardHeader>

  <CardContent className="space-y-1.5 text-sm">

    <div className="flex justify-between">
      <span>Peças</span>

      <span>
        {formatCurrency(
          wo.partsUsed.reduce(
            (
              sum: number,
              p: { quantity: number; unitCost: number }
            ) => sum + p.quantity * p.unitCost,
            0,
          ),
        )}
      </span>
    </div>


    <div className="flex justify-between">
      <span>Mão de obra</span>

      <span>
        {wo.laborEntries.reduce(
          (
            sum: number,
            l: { hours: number }
          ) => sum + l.hours,
          0,
        )}h
      </span>
    </div>


    <div className="flex justify-between border-t pt-2 font-semibold">
      <span>Total</span>

      <span>
        {formatCurrency(wo.totalCost)}
      </span>
    </div>

  </CardContent>
</Card>

        </div>

      </div>
    </div>
  );
}


function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />

      <div>
        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <p className="font-medium">
          {value}
        </p>
      </div>
    </div>
  );
}