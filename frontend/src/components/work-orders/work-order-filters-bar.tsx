import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSectors } from '@/hooks/use-lookups';
import { PRIORITY_LABELS, SPECIALTY_LABELS, STATUS_LABELS, MAINTENANCE_TYPE_LABELS } from '@/lib/domain';
import type { WorkOrderFilters } from '@/hooks/use-work-orders';

interface WorkOrderFiltersBarProps {
  filters: WorkOrderFilters;
  onChange: (filters: WorkOrderFilters) => void;
}

const ALL = '__all__';

export function WorkOrderFiltersBar({ filters, onChange }: WorkOrderFiltersBarProps) {
  const { data: sectors } = useSectors();

  const hasActiveFilters = Boolean(
    filters.status || filters.priority || filters.specialty || filters.sectorId || filters.search || filters.maintenanceType,
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="w-full sm:w-64">
        <Input
          placeholder="Buscar por código ou descrição..."
          icon={<Search className="h-4 w-4" />}
          value={filters.search ?? ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value || undefined, page: 1 })}
        />
      </div>

      <Select
        value={filters.status ?? ALL}
        onValueChange={(v) => onChange({ ...filters, status: v === ALL ? undefined : (v as any), page: 1 })}
      >
        <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos os status</SelectItem>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.priority ?? ALL}
        onValueChange={(v) => onChange({ ...filters, priority: v === ALL ? undefined : (v as any), page: 1 })}
      >
        <SelectTrigger className="w-36"><SelectValue placeholder="Prioridade" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Toda prioridade</SelectItem>
          {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.specialty ?? ALL}
        onValueChange={(v) => onChange({ ...filters, specialty: v === ALL ? undefined : (v as any), page: 1 })}
      >
        <SelectTrigger className="w-40"><SelectValue placeholder="Especialidade" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Toda especialidade</SelectItem>
          {Object.entries(SPECIALTY_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.maintenanceType ?? ALL}
        onValueChange={(v) => onChange({ ...filters, maintenanceType: v === ALL ? undefined : (v as any), page: 1 })}
      >
        <SelectTrigger className="w-36"><SelectValue placeholder="Tipo" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todo tipo</SelectItem>
          {Object.entries(MAINTENANCE_TYPE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.sectorId ?? ALL}
        onValueChange={(v) => onChange({ ...filters, sectorId: v === ALL ? undefined : v, page: 1 })}
      >
        <SelectTrigger className="w-44"><SelectValue placeholder="Setor" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todo setor</SelectItem>
          {sectors?.map((sector) => (
            <SelectItem key={sector.id} value={sector.id}>{sector.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={() => onChange({ page: 1, perPage: filters.perPage })}>
          <X className="h-3.5 w-3.5" /> Limpar
        </Button>
      )}
    </div>
  );
}
