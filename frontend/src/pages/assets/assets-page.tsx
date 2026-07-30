import { useState } from 'react';
import { AssetFiltersBar } from '@/components/assets/asset-filters-bar';
import { AssetCard } from '@/components/assets/asset-card';
import { NewAssetDialog } from '@/components/assets/new-asset-dialog';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { useAssets, type AssetFilters } from '@/hooks/use-assets';

export default function AssetsPage() {
  const [filters, setFilters] = useState<AssetFilters>({ page: 1, perPage: 12 });
  const { data, isLoading } = useAssets(filters);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ativos</h1>
          <p className="text-sm text-muted-foreground">Cadastro de máquinas e equipamentos da planta.</p>
        </div>
        <NewAssetDialog />
      </div>

      <AssetFiltersBar filters={filters} onChange={setFilters} />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      ) : data && data.data.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.data.map((asset) => <AssetCard key={asset.id} asset={asset} />)}
        </div>
      ) : (
        <Card><p className="py-16 text-center text-sm text-muted-foreground">Nenhum ativo encontrado.</p></Card>
      )}

      {data && (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          total={data.meta.total}
          perPage={data.meta.perPage}
          onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
        />
      )}
    </div>
  );
}
