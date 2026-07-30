import { usePurchaseOrders } from '@/hooks/use-purchases';
import { PurchaseOrderCard } from '@/components/purchases/purchase-order-card';
import { NewPurchaseOrderDialog } from '@/components/purchases/new-purchase-order-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import type { PurchaseStatus } from '@/types';

const COLUMNS: { status: PurchaseStatus; label: string }[] = [
  { status: 'SOLICITACAO', label: 'Solicitação' },
  { status: 'EM_COTACAO', label: 'Em cotação' },
  { status: 'PEDIDO_EMITIDO', label: 'Pedido emitido' },
  { status: 'MATERIAL_RECEBIDO', label: 'Material recebido' },
];

export default function PurchasesPage() {
  const { data, isLoading } = usePurchaseOrders();

  const grouped = COLUMNS.map((col) => ({
    ...col,
    orders: data?.data.filter((o) => o.status === col.status) ?? [],
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Compras</h1>
          <p className="text-sm text-muted-foreground">Acompanhe o fluxo de solicitação até o recebimento de materiais.</p>
        </div>
        <NewPurchaseOrderDialog />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {grouped.map((col) => (
          <div key={col.status} className="space-y-3">
            <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
              <p className="text-sm font-medium">{col.label}</p>
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {col.orders.length}
              </span>
            </div>

            <div className="space-y-3">
              {isLoading && Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
              {!isLoading && col.orders.length === 0 && (
                <p className="rounded-md border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
                  Nenhum pedido aqui.
                </p>
              )}
              {col.orders.map((order) => <PurchaseOrderCard key={order.id} order={order} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
