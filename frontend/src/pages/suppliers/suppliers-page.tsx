import { useState } from 'react';
import { Mail, Phone, Search, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { NewSupplierDialog } from '@/components/suppliers/new-supplier-dialog';
import { useSuppliers } from '@/hooks/use-suppliers';

export default function SuppliersPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useSuppliers({ search: search || undefined });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Fornecedores</h1>
          <p className="text-sm text-muted-foreground">Cadastro de fornecedores de peças e serviços.</p>
        </div>
        <NewSupplierDialog />
      </div>

      <div className="w-full sm:w-64">
        <Input placeholder="Buscar fornecedor..." icon={<Search className="h-4 w-4" />} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : data && data.data.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((supplier) => (
            <Card key={supplier.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{supplier.name}</p>
                  {supplier.cnpj && <p className="font-data text-xs text-muted-foreground">{supplier.cnpj}</p>}
                </div>
                {supplier.rating && (
                  <span className="flex items-center gap-1 text-xs text-warning-foreground">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {supplier.rating}
                  </span>
                )}
              </div>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                {supplier.phone && <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {supplier.phone}</p>}
                {supplier.email && <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {supplier.email}</p>}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card><p className="py-16 text-center text-sm text-muted-foreground">Nenhum fornecedor cadastrado.</p></Card>
      )}
    </div>
  );
}
