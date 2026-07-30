import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSectors } from '@/hooks/use-lookups';
import { CRITICALITY_LABELS } from '@/lib/domain';
import type { AssetFilters } from '@/hooks/use-assets';

const ALL = '__all__';
const STATUS_LABELS: Record<string, string> = {
  OPERACIONAL: 'Operacional',
  EM_MANUTENCAO: 'Em manutenção',
  PARADO: 'Parado',
  RESERVA: 'Reserva',
  DESATIVADO: 'Desativado',
};

interface AssetFiltersBarProps {
  filters: AssetFilters;
  onChange: (filters: AssetFilters) => void;
}

export function AssetFiltersBar({ filters, onChange }: AssetFiltersBarProps) {
  const { data: sectors } = useSectors();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="w-full sm:w-64">
        <Input
          placeholder="Buscar por nome, TAG ou código..."
          icon={<Search className="h-4 w-4" />}
          value={filters.search ?? ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value || undefined, page: 1 })}
        />
      </div>

      <Select value={filters.sectorId ?? ALL} onValueChange={(v) => onChange({ ...filters, sectorId: v === ALL ? undefined : v, page: 1 })}>
        <SelectTrigger className="w-44"><SelectValue placeholder="Setor" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todo setor</SelectItem>
          {sectors?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.criticality ?? ALL} onValueChange={(v) => onChange({ ...filters, criticality: v === ALL ? undefined : (v as any), page: 1 })}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Criticidade" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Toda criticidade</SelectItem>
          {Object.entries(CRITICALITY_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.status ?? ALL} onValueChange={(v) => onChange({ ...filters, status: v === ALL ? undefined : (v as any), page: 1 })}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todo status</SelectItem>
          {Object.entries(STATUS_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
