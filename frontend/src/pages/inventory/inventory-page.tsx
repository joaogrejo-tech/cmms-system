import { useState } from 'react';
import { AlertTriangle, ArrowRightLeft, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { NewPartDialog } from '@/components/inventory/new-part-dialog';
import { StockMovementDialog } from '@/components/inventory/stock-movement-dialog';
import { useParts, type PartFilters, type PartRow } from '@/hooks/use-inventory';
import { formatCurrency } from '@/lib/domain';

export default function InventoryPage() {
  const [filters, setFilters] = useState<PartFilters>({ page: 1, perPage: 15 });
  const [selectedPart, setSelectedPart] = useState<PartRow | null>(null);
  const { data, isLoading } = useParts(filters);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Estoque</h1>
          <p className="text-sm text-muted-foreground">Peças e materiais utilizados na manutenção.</p>
        </div>
        <NewPartDialog />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="w-full sm:w-64">
          <Input
            placeholder="Buscar por nome ou código..."
            icon={<Search className="h-4 w-4" />}
            value={filters.search ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined, page: 1 }))}
          />
        </div>
        <Button
          variant={filters.belowMinimum === 'true' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilters((f) => ({ ...f, belowMinimum: f.belowMinimum === 'true' ? undefined : 'true', page: 1 }))}
        >
          <AlertTriangle className="h-3.5 w-3.5" /> Abaixo do mínimo
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Peça</th>
                <th className="px-4 py-3">Localização</th>
                <th className="px-4 py-3">Saldo</th>
                <th className="px-4 py-3">Estoque mínimo</th>
                <th className="px-4 py-3">Custo unitário</th>
                <th className="px-4 py-3">Fornecedor</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><Skeleton className="h-6 w-full" /></td></tr>
                ))}
              {!isLoading && data?.data.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">Nenhuma peça encontrada.</td></tr>
              )}
              {!isLoading &&
                data?.data.map((part) => (
                  <tr key={part.id} className="hover:bg-surface-hover">
                    <td className="whitespace-nowrap px-4 py-3 font-data text-xs">{part.code}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{part.name}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{part.location ?? '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-data font-medium">{part.quantity} {part.unit}</span>
                        {part.belowMinimum && <Badge variant="destructive"><AlertTriangle className="h-3 w-3" /> Baixo</Badge>}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{part.minStock} {part.unit}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-data">{formatCurrency(part.unitCost)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{part.supplier?.name ?? '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Button variant="outline" size="sm" onClick={() => setSelectedPart(part)}>
                        <ArrowRightLeft className="h-3.5 w-3.5" /> Movimentar
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {data && (
          <Pagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            total={data.meta.total}
            perPage={data.meta.perPage}
            onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
          />
        )}
      </Card>

      <StockMovementDialog part={selectedPart} onClose={() => setSelectedPart(null)} />
    </div>
  );
}
