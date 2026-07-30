import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRegisterStockMovement, type PartRow } from '@/hooks/use-inventory';

interface StockMovementDialogProps {
  part: PartRow | null;
  onClose: () => void;
}

const TYPE_LABELS = { ENTRADA: 'Entrada', SAIDA: 'Saída', AJUSTE: 'Ajuste', DEVOLUCAO: 'Devolução' };

export function StockMovementDialog({ part, onClose }: StockMovementDialogProps) {
  const [type, setType] = useState<'ENTRADA' | 'SAIDA' | 'AJUSTE' | 'DEVOLUCAO'>('ENTRADA');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('');
  const registerMovement = useRegisterStockMovement();

  return (
    <Dialog open={Boolean(part)} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Movimentar estoque</DialogTitle>
          <DialogDescription>{part?.name} · Saldo atual: {part?.quantity} {part?.unit}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Tipo de movimentação</Label>
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quantity">Quantidade</Label>
            <Input id="quantity" type="number" min={0.01} step={0.01} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reason">Motivo (opcional)</Label>
            <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex: ajuste de inventário" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            loading={registerMovement.isPending}
            disabled={!part || Number(quantity) <= 0}
            onClick={() =>
              part &&
              registerMovement.mutate(
                { id: part.id, type, quantity: Number(quantity), reason: reason || undefined },
                {
                  onSuccess: () => {
                    toast.success('Movimentação registrada!');
                    onClose();
                  },
                  onError: () => toast.error('Não foi possível registrar a movimentação (estoque insuficiente?).'),
                },
              )
            }
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
