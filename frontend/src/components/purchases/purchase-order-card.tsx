import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/domain';
import { useChangePurchaseOrderStatus, type PurchaseOrderSummary } from '@/hooks/use-purchases';
import type { PurchaseStatus } from '@/types';
import { toast } from 'sonner';

const NEXT_STATUS: Partial<Record<PurchaseStatus, { status: PurchaseStatus; label: string }>> = {
  SOLICITACAO: { status: 'EM_COTACAO', label: 'Enviar para cotação' },
  EM_COTACAO: { status: 'PEDIDO_EMITIDO', label: 'Emitir pedido' },
  PEDIDO_EMITIDO: { status: 'MATERIAL_RECEBIDO', label: 'Confirmar recebimento' },
};

export function PurchaseOrderCard({ order }: { order: PurchaseOrderSummary }) {
  const changeStatus = useChangePurchaseOrderStatus();
  const next = NEXT_STATUS[order.status];

  return (
    <Card>
      <CardContent className="space-y-2.5 p-3.5">
        <div className="flex items-center justify-between">
          <span className="font-data text-xs font-medium text-primary">{order.code}</span>
          <span className="text-[11px] text-muted-foreground">{formatDate(order.requestedAt)}</span>
        </div>

        <p className="text-sm font-medium">{order.supplier?.name ?? 'Fornecedor a definir'}</p>

        <div className="space-y-0.5">
          {order.items.slice(0, 2).map((item) => (
            <p key={item.id} className="line-clamp-1 text-xs text-muted-foreground">
              {item.quantity}x {item.description}
            </p>
          ))}
          {order.items.length > 2 && (
            <p className="text-xs text-muted-foreground">+{order.items.length - 2} item(ns)</p>
          )}
        </div>

        <p className="font-data text-sm font-semibold">{formatCurrency(order.totalValue)}</p>

        {next && (
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            loading={changeStatus.isPending}
            onClick={() =>
              changeStatus.mutate(
                { id: order.id, status: next.status },
                {
                  onSuccess: () => toast.success('Status do pedido atualizado!'),
                  onError: () => toast.error('Não foi possível atualizar o pedido.'),
                },
              )
            }
          >
            {next.label} <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
