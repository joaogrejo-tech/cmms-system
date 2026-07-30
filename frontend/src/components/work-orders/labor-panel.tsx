import { useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUsers } from '@/hooks/use-lookups';
import { useAddLaborEntry } from '@/hooks/use-work-orders';
import { formatDate } from '@/lib/domain';

interface LaborPanelProps {
  workOrderId: number;
  laborEntries: Array<{ id: string; hours: number; date: string; user: { id: string; name: string } }>;
}

export function LaborPanel({ workOrderId, laborEntries }: LaborPanelProps) {
  const [userId, setUserId] = useState('');
  const [hours, setHours] = useState('1');
  const { data: technicians } = useUsers({});
  const addLabor = useAddLaborEntry();

  const totalHours = laborEntries.reduce((sum, e) => sum + e.hours, 0);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {laborEntries.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma hora registrada.</p>}
        {laborEntries.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
            <div>
              <p className="font-medium">{entry.user.name}</p>
              <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
            </div>
            <p className="font-data font-medium">{entry.hours}h</p>
          </div>
        ))}
        {laborEntries.length > 0 && (
          <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold">
            <span>Total de horas</span>
            <span className="font-data">{totalHours}h</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger className="flex-1"><SelectValue placeholder="Selecione o técnico" /></SelectTrigger>
          <SelectContent>
            {technicians?.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="number" min={0.5} step={0.5} value={hours} onChange={(e) => setHours(e.target.value)} className="w-24" />
        <Button
          variant="outline"
          size="icon"
          disabled={!userId || Number(hours) <= 0}
          loading={addLabor.isPending}
          onClick={() =>
            addLabor.mutate(
              { id: workOrderId, userId, hours: Number(hours) },
              {
                onSuccess: () => {
                  toast.success('Horas registradas.');
                  setUserId('');
                  setHours('1');
                },
                onError: () => toast.error('Não foi possível registrar as horas.'),
              },
            )
          }
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
