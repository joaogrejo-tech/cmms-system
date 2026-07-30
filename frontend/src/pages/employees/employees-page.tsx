import { useState } from 'react';
import { toast } from 'sonner';
import { Search, UserX } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { NewEmployeeDialog } from '@/components/employees/new-employee-dialog';
import { useDeactivateEmployee, useEmployees, type EmployeeFilters } from '@/hooks/use-employees';
import { ROLE_LABELS, SPECIALTY_LABELS, getInitials } from '@/lib/domain';

const ALL = '__all__';

export default function EmployeesPage() {
  const [filters, setFilters] = useState<EmployeeFilters>({ page: 1, perPage: 15, active: 'true' });
  const { data, isLoading } = useEmployees(filters);
  const deactivate = useDeactivateEmployee();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Funcionários</h1>
          <p className="text-sm text-muted-foreground">Gestão de usuários e perfis de acesso ao sistema.</p>
        </div>
        <NewEmployeeDialog />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="w-full sm:w-64">
          <Input
            placeholder="Buscar por nome, e-mail ou matrícula..."
            icon={<Search className="h-4 w-4" />}
            value={filters.search ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined, page: 1 }))}
          />
        </div>
        <Select value={filters.role ?? ALL} onValueChange={(v) => setFilters((f) => ({ ...f, role: v === ALL ? undefined : (v as any), page: 1 }))}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Perfil" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todo perfil</SelectItem>
            {Object.entries(ROLE_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">Funcionário</th>
                <th className="px-4 py-3">Perfil</th>
                <th className="px-4 py-3">Especialidade</th>
                <th className="px-4 py-3">Setor</th>
                <th className="px-4 py-3">Matrícula</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><Skeleton className="h-8 w-full" /></td></tr>
                ))}
              {!isLoading && data?.data.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">Nenhum funcionário encontrado.</td></tr>
              )}
              {!isLoading &&
                data?.data.map((employee) => (
                  <tr key={employee.id} className="hover:bg-surface-hover">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-[10px]">{getInitials(employee.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-xs text-muted-foreground">{employee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3"><Badge variant="secondary">{ROLE_LABELS[employee.role]}</Badge></td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {employee.specialty ? SPECIALTY_LABELS[employee.specialty] : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{employee.sector?.name ?? '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-data text-xs text-muted-foreground">{employee.registration ?? '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() =>
                          deactivate.mutate(employee.id, {
                            onSuccess: () => toast.success('Funcionário desativado.'),
                            onError: () => toast.error('Não foi possível desativar o funcionário.'),
                          })
                        }
                      >
                        <UserX className="h-3.5 w-3.5" /> Desativar
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
    </div>
  );
}
