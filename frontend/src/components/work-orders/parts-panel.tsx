import { useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePartsLookup } from '@/hooks/use-lookups';
import { useAddWorkOrderPart } from '@/hooks/use-work-orders';
import { formatCurrency } from '@/lib/domain';

interface PartsPanelProps {
  workOrderId: number;
  partsUsed: Array<{ id: string; quantity: number; unitCost: number; part: { id: string; name: string; code: string; unit: string } }>;
}

export function PartsPanel({ workOrderId, partsUsed }: PartsPanelProps) {
  const [partId, setPartId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const { data: parts } = usePartsLookup();
  const addPart = useAddWorkOrderPart();

  const total = partsUsed.reduce((sum, p) => sum + p.quantity * p.unitCost, 0);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {partsUsed.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma peça utilizada.</p>}
        {partsUsed.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
            <div>
              <p className="font-medium">{p.part.name}</p>
              <p className="text-xs text-muted-foreground">
                {p.part.code} · {p.quantity} {p.part.unit} × {formatCurrency(p.unitCost)}
              </p>
            </div>
            <p className="font-data font-medium">{formatCurrency(p.quantity * p.unitCost)}</p>
          </div>
        ))}
        {partsUsed.length > 0 && (
          <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold">
            <span>Total em peças</span>
            <span className="font-data">{formatCurrency(total)}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Select value={partId} onValueChange={setPartId}>
          <SelectTrigger className="flex-1"><SelectValue placeholder="Selecione a peça" /></SelectTrigger>
          <SelectContent>
            {parts?.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} ({p.quantity} {p.unit} em estoque)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          min={0.01}
          step={0.01}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-24"
        />
        <Button
          variant="outline"
          size="icon"
          disabled={!partId || Number(quantity) <= 0}
          loading={addPart.isPending}
          onClick={() =>
            addPart.mutate(
              { id: workOrderId, partId, quantity: Number(quantity) },
              {
                onSuccess: () => {
                  toast.success('Peça registrada na OS.');
                  setPartId('');
                  setQuantity('1');
                },
                onError: () => toast.error('Não foi possível registrar a peça (verifique o estoque disponível).'),
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
