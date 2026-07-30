import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useChangeWorkOrderStatus } from '@/hooks/use-work-orders';
import { STATUS_LABELS } from '@/lib/domain';
import type { WorkOrderStatus } from '@/types';

const NEXT_STATUS_OPTIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  ABERTA: ['EM_ANALISE', 'EM_ANDAMENTO', 'CANCELADA'],
  EM_ANALISE: ['EM_ANDAMENTO', 'AGUARDANDO_PECA', 'CANCELADA'],
  AGUARDANDO_PECA: ['EM_ANDAMENTO', 'PAUSADA', 'CANCELADA'],
  EM_ANDAMENTO: ['PAUSADA', 'AGUARDANDO_PECA', 'CONCLUIDA', 'CANCELADA'],
  PAUSADA: ['EM_ANDAMENTO', 'CANCELADA'],
  CONCLUIDA: [],
  CANCELADA: [],
};

export function StatusChanger({ workOrderId, currentStatus }: { workOrderId: number; currentStatus: WorkOrderStatus }) {
  const [nextStatus, setNextStatus] = useState<string>('');
  const [note, setNote] = useState('');
  const changeStatus = useChangeWorkOrderStatus();

  const options = NEXT_STATUS_OPTIONS[currentStatus];

  if (options.length === 0) {
    return <p className="text-xs text-muted-foreground">Esta OS está em um status final e não pode mais ser alterada.</p>;
  }

  return (
    <div className="space-y-2">
      <Select value={nextStatus} onValueChange={setNextStatus}>
        <SelectTrigger><SelectValue placeholder="Mudar status para..." /></SelectTrigger>
        <SelectContent>
          {options.map((status) => (
            <SelectItem key={status} value={status}>{STATUS_LABELS[status]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Textarea placeholder="Observação (opcional)" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
      <Button
        className="w-full"
        disabled={!nextStatus}
        loading={changeStatus.isPending}
        onClick={() =>
          changeStatus.mutate(
            { id: workOrderId, status: nextStatus as WorkOrderStatus, note: note || undefined },
            {
              onSuccess: () => {
                toast.success('Status atualizado com sucesso!');
                setNextStatus('');
                setNote('');
              },
              onError: () => toast.error('Não foi possível atualizar o status.'),
            },
          )
        }
      >
        Confirmar mudança
      </Button>
    </div>
  );
}
