import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { WorkOrderFiltersBar } from '@/components/work-orders/work-order-filters-bar';
import { WorkOrderTable } from '@/components/work-orders/work-order-table';
import { NewWorkOrderDialog } from '@/components/work-orders/new-work-order-dialog';
import { Pagination } from '@/components/ui/pagination';
import { useWorkOrders, type WorkOrderFilters } from '@/hooks/use-work-orders';

export default function WorkOrdersPage() {
  const [filters, setFilters] = useState<WorkOrderFilters>({ page: 1, perPage: 15, sortBy: 'openedAt', sortOrder: 'desc' });
  const { data, isLoading } = useWorkOrders(filters);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ordens de Serviço</h1>
          <p className="text-sm text-muted-foreground">Gerencie todas as OS da manutenção em um só lugar.</p>
        </div>
        <NewWorkOrderDialog />
      </div>

      <Card>
        <div className="border-b border-border p-4">
          <WorkOrderFiltersBar filters={filters} onChange={setFilters} />
        </div>

        <WorkOrderTable data={data?.data ?? []} isLoading={isLoading} />

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
    </div>
  );
}
