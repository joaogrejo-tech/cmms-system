import { useNavigate } from 'react-router-dom';
import { Cog, MapPin, ClipboardList } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CRITICALITY_LABELS } from '@/lib/domain';
import type { AssetSummary } from '@/hooks/use-assets';
import type { AssetCriticality, AssetStatus } from '@/types';

export const CRITICALITY_VARIANT: Record<AssetCriticality, 'muted' | 'info' | 'warning' | 'destructive'> = {
  BAIXA: 'muted',
  MEDIA: 'info',
  ALTA: 'warning',
  CRITICA: 'destructive',
};

export const ASSET_STATUS_VARIANT: Record<AssetStatus, 'success' | 'warning' | 'muted' | 'destructive' | 'info'> = {
  OPERACIONAL: 'success',
  EM_MANUTENCAO: 'warning',
  PARADO: 'destructive',
  RESERVA: 'info',
  DESATIVADO: 'muted',
};

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  OPERACIONAL: 'Operacional',
  EM_MANUTENCAO: 'Em manutenção',
  PARADO: 'Parado',
  RESERVA: 'Reserva',
  DESATIVADO: 'Desativado',
};

export function AssetCard({ asset }: { asset: AssetSummary }) {
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => navigate(`/assets/${asset.id}`)}
      className="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Cog className="h-5 w-5 text-primary" />
          </div>
          <Badge variant={CRITICALITY_VARIANT[asset.criticality]}>{CRITICALITY_LABELS[asset.criticality]}</Badge>
        </div>

        <div>
          <p className="font-data text-xs text-muted-foreground">{asset.tag}</p>
          <p className="line-clamp-1 font-medium">{asset.name}</p>
          {asset.manufacturer && <p className="text-xs text-muted-foreground">{asset.manufacturer}</p>}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {asset.sector.name}</span>
          <span className="flex items-center gap-1"><ClipboardList className="h-3.5 w-3.5" /> {asset._count?.workOrders ?? 0} OS</span>
        </div>

        <Badge variant={ASSET_STATUS_VARIANT[asset.status]}>{ASSET_STATUS_LABELS[asset.status]}</Badge>
      </CardContent>
    </Card>
  );
}
